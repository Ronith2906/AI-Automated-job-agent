'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { 
  Brain, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  MessageSquare,
  Bell,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { useJobAgent } from '@/hooks/useJobAgent'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import { JobOpportunityCard } from '@/components/JobOpportunityCard'
import { ResumeOptimizationPanel } from '@/components/ResumeOptimizationPanel'
import { AIInsightsWidget } from '@/components/AIInsightsWidget'
import { InterviewScheduler } from '@/components/InterviewScheduler'

interface DashboardMetrics {
  totalApplications: number
  responseRate: number
  interviewsScheduled: number
  avgFitScore: number
  monthlyGrowth: number
  activeJobs: number
  successRate: number
  aiOptimizations: number
}

interface JobOpportunity {
  id: string
  title: string
  company: string
  location: string
  salary: string
  fitScore: number
  status: 'analyzing' | 'optimized' | 'applied' | 'responded' | 'interviewed' | 'rejected'
  appliedDate?: string
  responseDate?: string
  aiInsights: {
    keywordMatch: number
    skillAlignment: number
    cultureFit: number
    careerGrowth: number
  }
  applicationStrategy: {
    timing: string
    highlights: string[]
    customization: string[]
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88']

// Mock data - in real app, this would come from your backend
const mockMetrics: DashboardMetrics = {
  totalApplications: 156,
  responseRate: 24.3,
  interviewsScheduled: 12,
  avgFitScore: 78.5,
  monthlyGrowth: 12.8,
  activeJobs: 34,
  successRate: 18.2,
  aiOptimizations: 89
}

const mockChartData = [
  { name: 'Jan', applications: 12, responses: 3, interviews: 1 },
  { name: 'Feb', applications: 19, responses: 5, interviews: 2 },
  { name: 'Mar', applications: 23, responses: 8, interviews: 3 },
  { name: 'Apr', applications: 31, responses: 12, interviews: 4 },
  { name: 'May', applications: 28, responses: 9, interviews: 2 },
  { name: 'Jun', applications: 43, responses: 15, interviews: 6 },
]

const mockJobOpportunities: JobOpportunity[] = [
  {
    id: '1',
    title: 'Senior AI Engineer',
    company: 'TechCorp AI',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    fitScore: 94,
    status: 'optimized',
    aiInsights: {
      keywordMatch: 92,
      skillAlignment: 88,
      cultureFit: 95,
      careerGrowth: 98
    },
    applicationStrategy: {
      timing: 'Apply within 24 hours',
      highlights: ['ML expertise', 'Previous AI projects', 'Leadership experience'],
      customization: ['Emphasize GPT experience', 'Highlight scalability projects']
    }
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'DataFlow Inc',
    location: 'Remote',
    salary: '$120k - $160k',
    fitScore: 87,
    status: 'applied',
    appliedDate: '2024-01-15',
    aiInsights: {
      keywordMatch: 85,
      skillAlignment: 90,
      cultureFit: 82,
      careerGrowth: 91
    },
    applicationStrategy: {
      timing: 'Applied',
      highlights: ['Python expertise', 'MLOps experience', 'Data pipeline'],
      customization: ['Focus on cloud experience', 'Mention open source contributions']
    }
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    salary: '$100k - $140k',
    fitScore: 76,
    status: 'responded',
    appliedDate: '2024-01-10',
    responseDate: '2024-01-18',
    aiInsights: {
      keywordMatch: 78,
      skillAlignment: 82,
      cultureFit: 70,
      careerGrowth: 75
    },
    applicationStrategy: {
      timing: 'Interview scheduled',
      highlights: ['React expertise', 'Node.js backend', 'Startup experience'],
      customization: ['Emphasize agility', 'Highlight rapid prototyping']
    }
  }
]

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Custom hooks for real-time data
  const { metrics, jobOpportunities, isLoading, error } = useJobAgent()
  const { notifications, unreadCount } = useRealTimeUpdates()

  // Use mock data for demo
  const displayMetrics = metrics || mockMetrics
  const displayJobs = jobOpportunities || mockJobOpportunities

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up',
    description 
  }: {
    title: string
    value: string | number
    change?: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
    description?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {trend === 'up' ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>
                {change}
              </span>
              {description && <span className="ml-1">{description}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Applications"
          value={displayMetrics.totalApplications}
          change="+12.3%"
          icon={FileText}
          description="from last month"
        />
        <MetricCard
          title="Response Rate"
          value={`${displayMetrics.responseRate}%`}
          change="+2.1%"
          icon={TrendingUp}
          description="industry avg: 3.2%"
        />
        <MetricCard
          title="Interviews Scheduled"
          value={displayMetrics.interviewsScheduled}
          change="+4"
          icon={Calendar}
          description="this month"
        />
        <MetricCard
          title="Avg Fit Score"
          value={`${displayMetrics.avgFitScore}%`}
          change="+5.2%"
          icon={Target}
          description="AI optimization"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
            <CardDescription>
              Monthly application and response data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Applications"
                />
                <Line 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Responses"
                />
                <Line 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Interviews"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Performance Metrics</CardTitle>
            <CardDescription>
              How AI optimization improves your results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Keyword Optimization</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Resume Matching</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Application Success</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Interview Conversion</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
          <CardDescription>
            Latest automated actions and optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Resume optimized for Senior AI Engineer at TechCorp',
                time: '2 minutes ago',
                status: 'success',
                score: 94
              },
              {
                action: 'Job match found: ML Engineer at DataFlow Inc',
                time: '15 minutes ago',
                status: 'info',
                score: 87
              },
              {
                action: 'Cover letter generated for Full Stack Developer',
                time: '1 hour ago',
                status: 'success',
                score: 91
              },
              {
                action: 'Interview invitation detected from StartupXYZ',
                time: '2 hours ago',
                status: 'success',
                score: null
              }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                {activity.score && (
                  <Badge variant={activity.score > 90 ? 'default' : 'secondary'}>
                    {activity.score}% fit
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const JobsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Opportunities</h2>
          <p className="text-muted-foreground">
            AI-powered job matching and optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <JobOpportunityCard job={job} />
          </motion.div>
        ))}
      </div>
    </div>
  )

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Success Rate Analysis</CardTitle>
            <CardDescription>
              Application success by job category and company size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { category: 'AI/ML', applications: 45, success: 12 },
                { category: 'Full Stack', applications: 38, success: 8 },
                { category: 'Backend', applications: 32, success: 6 },
                { category: 'Frontend', applications: 28, success: 5 },
                { category: 'DevOps', applications: 13, success: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                <Bar dataKey="success" fill="#82ca9d" name="Success" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Current status distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Applied', value: 45, color: '#8884d8' },
                    { name: 'Responded', value: 12, color: '#82ca9d' },
                    { name: 'Interviewed', value: 8, color: '#ffc658' },
                    { name: 'Rejected', value: 23, color: '#ff7300' },
                    { name: 'Pending', value: 18, color: '#00ff88' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Optimization Impact</CardTitle>
            <CardDescription>
              Before vs After AI optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-500">3.2%</p>
                  <p className="text-sm text-muted-foreground">Before AI</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">24.3%</p>
                  <p className="text-sm text-muted-foreground">With AI</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-500">+659% Improvement</p>
                <p className="text-sm text-muted-foreground">in response rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Savings</CardTitle>
            <CardDescription>
              Automation impact on job search time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Manual job search</span>
                <span className="font-medium">40 hrs/week</span>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span>With AI automation</span>
                <span className="font-medium">8 hrs/week</span>
              </div>
              <Progress value={20} className="h-2" />
              
              <div className="text-center pt-2">
                <p className="text-lg font-semibold text-blue-500">32 hours saved</p>
                <p className="text-sm text-muted-foreground">per week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="mr-3 h-8 w-8 text-blue-500" />
              AI Job Agent Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Intelligent job search automation powered by advanced AI
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={isAutoMode ? "default" : "secondary"}>
                {isAutoMode ? "Auto Mode" : "Manual Mode"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                {isAutoMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="resumes" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Resumes
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-4">
                <OverviewTab />
              </TabsContent>
              
              <TabsContent value="jobs" className="space-y-4">
                <JobsTab />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <AnalyticsTab />
              </TabsContent>
              
              <TabsContent value="resumes" className="space-y-4">
                <ResumeOptimizationPanel />
              </TabsContent>
              
              <TabsContent value="interviews" className="space-y-4">
                <InterviewScheduler />
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <AIInsightsWidget />
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  )
}