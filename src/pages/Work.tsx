import { BentoTile } from '../components/ui/BentoTile';
import { motion } from 'framer-motion';

interface CaseStudyProps {
  company: string;
  role: string;
  period: string;
  challenges: {
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
}

const CaseStudy = ({ company, role, period, challenges }: CaseStudyProps) => (
  <BentoTile className="flex flex-col gap-6">
    <div className="border-b border-gray-100 pb-4 mb-2">
      <h2 className="text-2xl font-bold text-gray-900">{company}</h2>
      <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{role}</span>
        <span>{period}</span>
      </div>
    </div>

    <div className="space-y-8">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="relative pl-6 border-l-2 border-gray-200 hover:border-blue-500 transition-colors">
          <h3 className="text-lg font-bold text-gray-800 mb-3">{challenge.title}</h3>
          <div className="space-y-2 text-sm leading-relaxed text-gray-600">
            <p><strong className="text-gray-900">Situation:</strong> {challenge.situation}</p>
            <p><strong className="text-gray-900">Task:</strong> {challenge.task}</p>
            <p><strong className="text-gray-900">Action:</strong> {challenge.action}</p>
            <p><strong className="text-blue-600">Result:</strong> {challenge.result}</p>
          </div>
        </div>
      ))}
    </div>
  </BentoTile>
);

export const Work = () => {
  const experiences = [
    {
      company: "MoEngage India Pvt. Ltd.",
      role: "Lead Frontend Engineer",
      period: "May 2021 - Present",
      challenges: [
        {
          title: "Micro-Frontend Architecture Migration",
          situation: "The organization faced slow build-to-release times of 50 minutes due to a monolithic architecture.",
          task: "Reduce build times and improve developer velocity.",
          action: "Spearheaded the development and implementation of the organization's first Micro-Frontend (MFE) architecture.",
          result: "Slashed build-to-release time from 50 minutes to just 5 minutes."
        },
        {
          title: "Reusable Form Builder",
          situation: "Creating new forms for different marketing channels was repetitive and time-consuming.",
          task: "Streamline the form creation process.",
          action: "Engineered a reusable Form Builder using React controlled components, integrated with the common component library.",
          result: "Cut development effort for new forms by over 45%."
        },
        {
          title: "New Channel Integration (RCS, MMS)",
          situation: "The dashboard needed to support new marketing channels to stay competitive.",
          task: "Integrate RCS, MMS, and Connected Apps into the existing dashboard.",
          action: "Pioneered the integration of these new channels.",
          result: "Achieved a 90% adoption rate by the existing client base and secured new competitive deals."
        }
      ]
    },
    {
      company: "Spotbee Tech Pvt Ltd",
      role: "Frontend Engineer",
      period: "April 2020 - May 2021",
      challenges: [
        {
          title: "Multitenant SaaS Application",
          situation: "Need for a comprehensive SaaS solution with scheduling, payments, and access control.",
          task: "Build the application end-to-end.",
          action: "Developed the application using Angular and TypeScript.",
          result: "Successfully launched a robust, feature-rich SaaS platform."
        },
        {
          title: "Video on Demand Platform",
          situation: "Users needed to upload and view videos reliably.",
          task: "Implement a video upload system.",
          action: "Built a platform using the TUS protocol for resilient video uploads.",
          result: "Enabled reliable video hosting and streaming for users."
        }
      ]
    },
    {
      company: "Gymday Technology Pvt Ltd",
      role: "Frontend Engineer",
      period: "Nov 2018 - April 2020",
      challenges: [
        {
          title: "CRM Performance Optimization",
          situation: "The primary CRM application had a slow loading time of 10 seconds.",
          task: "Optimize application performance.",
          action: "Optimized the codebase and assets.",
          result: "Decreased loading time by 80%, from 10 seconds to 2 seconds."
        },
        {
          title: "Centralized Style Repository",
          situation: "Inconsistent styles across new products slowed down development.",
          task: "Unify design and accelerate development.",
          action: "Created a centralized repository of consistent styles using SASS and Tailwind CSS.",
          result: "Accelerated development across new products."
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Work Experience</h1>
        <p className="text-gray-500">Case studies highlighting technical challenges and business impact.</p>
      </motion.div>

      {experiences.map((exp, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <CaseStudy {...exp} />
        </motion.div>
      ))}
    </div>
  );
};
