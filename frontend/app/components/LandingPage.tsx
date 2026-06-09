import { motion } from "framer-motion";
import { ChevronRight, Layout, Zap, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-500 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layout className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white font-sans">FlowState</span>
        </div>
        <div className="flex items-center gap-6">
          {/* <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            Log in
          </Link> */}
          <Link to="/auth" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-32 overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Manage projects <br />
            <span className="text-blue-600">without the chaos.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            FlowState helps teams move work forward. Organize tasks, collaborate with teammates, and hit deadlines like never before.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-blue-700 transition-all hover:scale-105">
              Start your board <ChevronRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full z-0 dark:bg-blue-900/20" />
      </section>

      {/* Features Grid */}
      <section className="px-8 py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />}
              title="Lightning Fast"
              description="Built with speed in mind. Drag, drop, and update tasks in real-time without refreshing."
            />
            <FeatureCard 
              icon={<Users className="text-blue-500" />}
              title="Team Sync"
              description="Collaborate seamlessly. Assign members, leave comments, and track progress together."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-500" />}
              title="Insightful Analytics"
              description="Visualize your team's throughput and identify bottlenecks before they happen."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-2xl bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm"
    >
      <div className="mb-4 h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}