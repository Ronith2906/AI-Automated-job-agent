"""
Multi-Agent AI System for Job Automation
Showcases advanced AI patterns and agent orchestration
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import openai
from pydantic import BaseModel

class AgentRole(Enum):
    JOB_HUNTER = "job_hunter"
    RESUME_EXPERT = "resume_expert"
    INTERVIEW_PREP = "interview_prep"
    MARKET_ANALYST = "market_analyst"
    NEGOTIATION_COACH = "negotiation_coach"

@dataclass
class JobOpportunity:
    id: str
    title: str
    company: str
    description: str
    requirements: List[str]
    salary_range: Optional[str]
    location: str
    fit_score: Optional[float] = None

@dataclass
class UserProfile:
    skills: List[str]
    experience: str
    education: str
    preferences: Dict[str, Any]
    current_resume: str

class AgentMemory:
    """Long-term memory system for AI agents"""
    
    def __init__(self):
        self.conversation_history: List[Dict] = []
        self.user_preferences: Dict = {}
        self.success_patterns: Dict = {}
        self.market_insights: Dict = {}
    
    def store_interaction(self, agent_role: AgentRole, context: Dict, outcome: Dict):
        """Store agent interaction for learning"""
        self.conversation_history.append({
            'timestamp': asyncio.get_event_loop().time(),
            'agent': agent_role.value,
            'context': context,
            'outcome': outcome
        })
    
    def get_relevant_context(self, agent_role: AgentRole, query: str) -> Dict:
        """Retrieve relevant context for agent decision making"""
        relevant_interactions = [
            interaction for interaction in self.conversation_history[-50:]  # Last 50 interactions
            if interaction['agent'] == agent_role.value
        ]
        return {
            'recent_interactions': relevant_interactions,
            'user_preferences': self.user_preferences.get(agent_role.value, {}),
            'success_patterns': self.success_patterns.get(agent_role.value, {})
        }

class BaseAgent:
    """Base class for all AI agents"""
    
    def __init__(self, role: AgentRole, model: str = "gpt-4", memory: AgentMemory = None):
        self.role = role
        self.model = model
        self.memory = memory or AgentMemory()
        self.client = openai.AsyncOpenAI()
    
    async def think(self, context: Dict) -> Dict:
        """Chain-of-thought reasoning process"""
        reasoning_prompt = f"""
        As a {self.role.value} agent, analyze the following context and provide your reasoning:
        
        Context: {json.dumps(context, indent=2)}
        
        Think through this step by step:
        1. What is the main objective?
        2. What information is most relevant?
        3. What are the potential approaches?
        4. What would be the best strategy?
        5. What are the expected outcomes?
        
        Provide your reasoning in a structured format.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": reasoning_prompt}
            ],
            temperature=0.1
        )
        
        return {"reasoning": response.choices[0].message.content}
    
    async def execute(self, task: Dict) -> Dict:
        """Execute agent-specific task"""
        # Get relevant context from memory
        context = self.memory.get_relevant_context(self.role, str(task))
        
        # Perform chain-of-thought reasoning
        reasoning = await self.think({**task, **context})
        
        # Execute the specific agent logic
        result = await self._execute_specific(task, reasoning)
        
        # Store interaction in memory
        self.memory.store_interaction(self.role, task, result)
        
        return result
    
    async def _execute_specific(self, task: Dict, reasoning: Dict) -> Dict:
        """Override in specific agent implementations"""
        raise NotImplementedError
    
    def _get_system_prompt(self) -> str:
        """Override in specific agent implementations"""
        raise NotImplementedError

class JobHunterAgent(BaseAgent):
    """AI agent specialized in finding and evaluating job opportunities"""
    
    def __init__(self, **kwargs):
        super().__init__(AgentRole.JOB_HUNTER, **kwargs)
    
    def _get_system_prompt(self) -> str:
        return """
        You are an expert Job Hunter AI agent. Your role is to:
        1. Search for relevant job opportunities
        2. Analyze job descriptions for fit
        3. Score opportunities based on user profile
        4. Identify the best application strategies
        
        You have deep knowledge of job markets, hiring trends, and what makes candidates successful.
        Always consider the user's career goals, preferences, and growth potential.
        """
    
    async def _execute_specific(self, task: Dict, reasoning: Dict) -> Dict:
        job_opportunities = task.get('job_opportunities', [])
        user_profile = task.get('user_profile')
        
        scored_jobs = []
        for job in job_opportunities:
            fit_score = await self._calculate_fit_score(job, user_profile)
            application_strategy = await self._generate_application_strategy(job, user_profile)
            
            scored_jobs.append({
                'job': job,
                'fit_score': fit_score,
                'application_strategy': application_strategy,
                'priority': 'high' if fit_score > 0.8 else 'medium' if fit_score > 0.6 else 'low'
            })
        
        # Sort by fit score
        scored_jobs.sort(key=lambda x: x['fit_score'], reverse=True)
        
        return {
            'scored_opportunities': scored_jobs,
            'recommendations': await self._generate_recommendations(scored_jobs),
            'reasoning': reasoning
        }
    
    async def _calculate_fit_score(self, job: JobOpportunity, user_profile: UserProfile) -> float:
        """Calculate job fit score using AI"""
        prompt = f"""
        Analyze the job fit between this candidate and job opportunity.
        Return a score between 0.0 and 1.0 where 1.0 is a perfect match.
        
        Candidate Profile:
        - Skills: {', '.join(user_profile.skills)}
        - Experience: {user_profile.experience}
        - Education: {user_profile.education}
        
        Job Opportunity:
        - Title: {job.title}
        - Company: {job.company}
        - Requirements: {', '.join(job.requirements)}
        - Description: {job.description[:500]}...
        
        Consider: skill alignment, experience level, career progression, company culture fit.
        Respond with only a number between 0.0 and 1.0.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        try:
            return float(response.choices[0].message.content.strip())
        except:
            return 0.5  # Default score if parsing fails
    
    async def _generate_application_strategy(self, job: JobOpportunity, user_profile: UserProfile) -> Dict:
        """Generate personalized application strategy"""
        prompt = f"""
        Create an application strategy for this job opportunity:
        
        Job: {job.title} at {job.company}
        Requirements: {', '.join(job.requirements)}
        
        Candidate strengths: {', '.join(user_profile.skills[:5])}
        
        Provide strategy for:
        1. Key points to highlight
        2. Application timing
        3. Follow-up approach
        4. Networking opportunities
        
        Return as JSON with keys: highlights, timing, followup, networking
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return {"highlights": [], "timing": "immediate", "followup": "1 week", "networking": []}
    
    async def _generate_recommendations(self, scored_jobs: List[Dict]) -> List[str]:
        """Generate strategic recommendations"""
        top_jobs = scored_jobs[:5]  # Top 5 opportunities
        
        recommendations = []
        if top_jobs:
            avg_score = sum(job['fit_score'] for job in top_jobs) / len(top_jobs)
            
            if avg_score > 0.8:
                recommendations.append("Excellent job market alignment! Focus on top 3 opportunities.")
            elif avg_score > 0.6:
                recommendations.append("Good opportunities available. Consider skill enhancement for better fit.")
            else:
                recommendations.append("Limited high-fit opportunities. Recommend expanding search criteria.")
        
        return recommendations

class ResumeExpertAgent(BaseAgent):
    """AI agent specialized in resume optimization"""
    
    def __init__(self, **kwargs):
        super().__init__(AgentRole.RESUME_EXPERT, **kwargs)
    
    def _get_system_prompt(self) -> str:
        return """
        You are an expert Resume Optimization AI agent. Your role is to:
        1. Analyze job requirements and match them to candidate experience
        2. Optimize resume content for ATS systems
        3. Improve keyword density and relevance
        4. Enhance formatting and presentation
        
        You understand hiring manager psychology and ATS algorithms.
        Always prioritize truthful representation while maximizing impact.
        """
    
    async def _execute_specific(self, task: Dict, reasoning: Dict) -> Dict:
        job = task.get('job')
        current_resume = task.get('current_resume')
        user_profile = task.get('user_profile')
        
        optimized_resume = await self._optimize_resume(job, current_resume, user_profile)
        ats_score = await self._calculate_ats_score(optimized_resume, job)
        improvements = await self._suggest_improvements(current_resume, optimized_resume)
        
        return {
            'optimized_resume': optimized_resume,
            'ats_score': ats_score,
            'improvements': improvements,
            'keyword_optimization': await self._analyze_keywords(job, optimized_resume),
            'reasoning': reasoning
        }
    
    async def _optimize_resume(self, job: JobOpportunity, current_resume: str, user_profile: UserProfile) -> str:
        """Optimize resume for specific job"""
        prompt = f"""
        Optimize this resume for the following job opportunity:
        
        Job Title: {job.title}
        Company: {job.company}
        Key Requirements: {', '.join(job.requirements)}
        Job Description: {job.description[:1000]}...
        
        Current Resume:
        {current_resume}
        
        Optimize by:
        1. Reordering sections for maximum impact
        2. Enhancing relevant experience descriptions
        3. Adding relevant keywords naturally
        4. Improving action verbs and quantified achievements
        5. Ensuring ATS compatibility
        
        Return the complete optimized resume.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        return response.choices[0].message.content
    
    async def _calculate_ats_score(self, resume: str, job: JobOpportunity) -> float:
        """Calculate ATS compatibility score"""
        prompt = f"""
        Analyze this resume for ATS (Applicant Tracking System) compatibility:
        
        Resume: {resume[:1000]}...
        Job Requirements: {', '.join(job.requirements)}
        
        Rate ATS compatibility (0.0-1.0) based on:
        1. Keyword matching
        2. Format compatibility
        3. Section organization
        4. Skill alignment
        
        Respond with only a number between 0.0 and 1.0.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        try:
            return float(response.choices[0].message.content.strip())
        except:
            return 0.7  # Default score
    
    async def _suggest_improvements(self, original: str, optimized: str) -> List[str]:
        """Suggest additional improvements"""
        prompt = f"""
        Compare the original and optimized resume and suggest 3-5 additional improvements:
        
        Original Resume (first 500 chars): {original[:500]}...
        Optimized Resume (first 500 chars): {optimized[:500]}...
        
        Suggest specific, actionable improvements as a JSON array of strings.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return ["Consider adding more quantified achievements", "Improve action verb variety"]
    
    async def _analyze_keywords(self, job: JobOpportunity, resume: str) -> Dict:
        """Analyze keyword optimization"""
        job_keywords = set(job.requirements + job.description.lower().split())
        resume_words = set(resume.lower().split())
        
        matched_keywords = job_keywords.intersection(resume_words)
        missing_keywords = job_keywords - resume_words
        
        return {
            'matched_count': len(matched_keywords),
            'missing_count': len(missing_keywords),
            'match_percentage': len(matched_keywords) / len(job_keywords) if job_keywords else 0,
            'top_missing': list(missing_keywords)[:10]
        }

class AgentOrchestrator:
    """Central coordinator for managing agent interactions"""
    
    def __init__(self):
        self.memory = AgentMemory()
        self.agents = {
            AgentRole.JOB_HUNTER: JobHunterAgent(memory=self.memory),
            AgentRole.RESUME_EXPERT: ResumeExpertAgent(memory=self.memory),
            # Add other agents as needed
        }
        self.active_workflows: Dict[str, Dict] = {}
    
    async def execute_workflow(self, workflow_id: str, initial_task: Dict) -> Dict:
        """Execute a multi-agent workflow"""
        workflow = {
            'id': workflow_id,
            'status': 'running',
            'results': {},
            'current_step': 0,
            'steps': []
        }
        
        self.active_workflows[workflow_id] = workflow
        
        try:
            # Step 1: Job hunting and analysis
            job_results = await self.agents[AgentRole.JOB_HUNTER].execute(initial_task)
            workflow['results']['job_analysis'] = job_results
            workflow['current_step'] = 1
            
            # Step 2: Resume optimization for top opportunities
            top_jobs = job_results['scored_opportunities'][:3]  # Top 3 jobs
            resume_results = []
            
            for job_opportunity in top_jobs:
                resume_task = {
                    'job': job_opportunity['job'],
                    'current_resume': initial_task.get('user_profile', {}).get('current_resume', ''),
                    'user_profile': initial_task.get('user_profile')
                }
                
                resume_result = await self.agents[AgentRole.RESUME_EXPERT].execute(resume_task)
                resume_results.append({
                    'job': job_opportunity['job'],
                    'optimization': resume_result
                })
            
            workflow['results']['resume_optimizations'] = resume_results
            workflow['current_step'] = 2
            workflow['status'] = 'completed'
            
            return {
                'workflow_id': workflow_id,
                'status': 'completed',
                'job_analysis': job_results,
                'resume_optimizations': resume_results,
                'summary': await self._generate_workflow_summary(workflow['results'])
            }
            
        except Exception as e:
            workflow['status'] = 'failed'
            workflow['error'] = str(e)
            return {'workflow_id': workflow_id, 'status': 'failed', 'error': str(e)}
    
    async def _generate_workflow_summary(self, results: Dict) -> Dict:
        """Generate a summary of the workflow execution"""
        job_analysis = results.get('job_analysis', {})
        resume_optimizations = results.get('resume_optimizations', [])
        
        scored_jobs = job_analysis.get('scored_opportunities', [])
        top_job = scored_jobs[0] if scored_jobs else None
        
        return {
            'total_jobs_analyzed': len(scored_jobs),
            'high_fit_jobs': len([job for job in scored_jobs if job['fit_score'] > 0.8]),
            'top_opportunity': {
                'title': top_job['job'].title if top_job else 'None',
                'company': top_job['job'].company if top_job else 'None',
                'fit_score': top_job['fit_score'] if top_job else 0
            } if top_job else None,
            'resumes_optimized': len(resume_optimizations),
            'avg_ats_score': sum(opt['optimization']['ats_score'] for opt in resume_optimizations) / len(resume_optimizations) if resume_optimizations else 0,
            'recommendations': job_analysis.get('recommendations', [])
        }
    
    def get_workflow_status(self, workflow_id: str) -> Dict:
        """Get current status of a workflow"""
        return self.active_workflows.get(workflow_id, {'status': 'not_found'})

# Example usage
async def main():
    """Example of how to use the multi-agent system"""
    
    # Initialize orchestrator
    orchestrator = AgentOrchestrator()
    
    # Sample user profile
    user_profile = UserProfile(
        skills=['Python', 'Machine Learning', 'REST APIs', 'SQL', 'Docker'],
        experience='5 years software development',
        education='BS Computer Science',
        preferences={'location': 'Remote', 'salary_min': 100000},
        current_resume="John Doe\nSoftware Engineer\n5 years experience in Python and ML..."
    )
    
    # Sample job opportunities
    job_opportunities = [
        JobOpportunity(
            id='1',
            title='Senior ML Engineer',
            company='TechCorp',
            description='We are looking for an experienced ML engineer...',
            requirements=['Python', 'Machine Learning', 'TensorFlow', 'AWS'],
            salary_range='120k-150k',
            location='Remote'
        ),
        JobOpportunity(
            id='2',
            title='Full Stack Developer',
            company='StartupXYZ',
            description='Join our fast-growing startup...',
            requirements=['Python', 'React', 'REST APIs', 'PostgreSQL'],
            salary_range='90k-120k',
            location='San Francisco'
        )
    ]
    
    # Execute workflow
    initial_task = {
        'user_profile': user_profile,
        'job_opportunities': job_opportunities
    }
    
    result = await orchestrator.execute_workflow('workflow_001', initial_task)
    
    print("Workflow Results:")
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())