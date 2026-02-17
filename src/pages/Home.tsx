import { BentoTile } from '../components/ui/BentoTile';
import { MagneticButton } from '../components/ui/MagneticButton';
import { Github, Linkedin, Mail, MapPin, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        {/* Bio Section - Large Tile */}
        <BentoTile className="md:col-span-2 md:row-span-2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Dharani Jayakanthan
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-6 font-medium">
              Lead Front-end Engineer
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              7+ years of experience in architecting scalable, configurable, and high-performing SaaS Marketing applications. Specialized in crafting Marketing SASS web solutions and Business solutions for fitness SASS from scratch.
            </p>
            <div className="flex gap-3 flex-wrap">
               <a href="mailto:contact@example.com" className="inline-block"> {/* Placeholder email */}
                <MagneticButton className="px-5 py-2.5 bg-gray-900 text-white rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors">
                  <Mail size={18} />
                  <span>Contact Me</span>
                </MagneticButton>
              </a>
              <a href="/resume.pdf" target="_blank" className="inline-block"> {/* Placeholder resume */}
                 <MagneticButton className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  <Download size={18} />
                  <span>Resume</span>
                </MagneticButton>
              </a>
            </div>
          </motion.div>
        </BentoTile>

        {/* Location - Small Tile */}
        <BentoTile className="md:col-span-1 flex flex-col items-center justify-center text-center bg-blue-50 border-blue-100">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-blue-500">
            <MapPin size={24} />
          </div>
          <h3 className="font-semibold text-gray-900">Bangalore, India</h3>
          <p className="text-sm text-gray-500">Based in</p>
        </BentoTile>

         {/* Social Links - Small Tile */}
        <BentoTile className="md:col-span-1 flex flex-col justify-center gap-4">
           <a href="https://github.com/dharanijayakanthan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
              <Github size={20} />
            </div>
            <span className="font-medium">GitHub</span>
            <ExternalLink size={14} className="ml-auto text-gray-400" />
          </a>
          <a href="https://in.linkedin.com/in/dharani-jayakanthan-2275a612a" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
              <Linkedin size={20} />
            </div>
            <span className="font-medium">LinkedIn</span>
            <ExternalLink size={14} className="ml-auto text-gray-400" />
          </a>
        </BentoTile>

        {/* Skills - Wide Tile */}
        <BentoTile className="md:col-span-2 md:row-span-1 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Core Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "React", "Angular", "TypeScript", "Micro-Frontends",
              "Web Performance", "SaaS Architecture", "Redux",
              "Next.js", "Tailwind CSS", "Node.js"
            ].map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </BentoTile>

        {/* Education - Small Tile */}
         <BentoTile className="md:col-span-1 flex flex-col justify-center bg-orange-50 border-orange-100">
           <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">Education</h3>
           <p className="font-bold text-gray-900">M.S. Software Engineering</p>
           <p className="text-sm text-gray-600">VIT University, Vellore</p>
           <p className="text-xs text-gray-500 mt-1">5 Year Integrated</p>
        </BentoTile>

         {/* Stats / More Info - Small Tile */}
         <BentoTile className="md:col-span-1 flex flex-col items-center justify-center text-center bg-gray-900 text-white border-gray-800">
           <h3 className="text-4xl font-bold font-mono">7+</h3>
           <p className="text-gray-400 text-sm mt-1">Years Experience</p>
        </BentoTile>

      </div>
    </div>
  );
};
