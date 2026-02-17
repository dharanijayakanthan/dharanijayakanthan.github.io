import { BentoTile } from '../components/ui/BentoTile';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

interface ProjectProps {
  title: string;
  role: string;
  tech: string[];
  description: string;
  image: string;
  link?: string;
  github?: string;
}

const ProjectCard = ({ title, role, tech, description, image, link, github }: ProjectProps) => (
  <BentoTile className="flex flex-col h-full p-0 overflow-hidden group">
    <div className="h-48 overflow-hidden bg-gray-100 relative">
       {/* Image placeholder or actual image */}
       <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm font-medium text-blue-600 mb-2">{role}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tech.map((t, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
              {t}
            </span>
          ))}
        </div>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
          {description}
        </p>
      </div>

      <div className="mt-auto flex gap-3 pt-4">
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1">
            <MagneticButton className="w-full py-2 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-800 transition-colors">
              <ExternalLink size={14} />
              <span>Live Demo</span>
            </MagneticButton>
          </a>
        )}
        {github && (
           <a href={github} target="_blank" rel="noopener noreferrer" className="flex-1">
             <MagneticButton className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors">
               <Github size={14} />
               <span>Code</span>
             </MagneticButton>
           </a>
        )}
      </div>
    </div>
  </BentoTile>
);

export const Lab = () => {
  const projects = [
    {
      title: "SKOOL v0.001",
      role: "Full Stack Developer",
      tech: ["MEAN", "Bootstrap4", "HTML5", "CSS3", "Heroku"],
      description: "Skool is a product for aspiring parents who want their kids to get admission in standard schools. Built from scratch (front to back). Authenticates users, allows school search, and application submission. Includes admin functionality for shortlisting.",
      image: "/assets/images/skool1.png",
      link: "http://dharanijayakanthan.herokuapp.com/#/skool/preperation"
    },
    {
      title: "INKOOP",
      role: "Web Designer",
      tech: ["Jekyll", "Bootstrap3", "HTML5", "CSS3", "Node"],
      description: "Redesign of Inkoop's company website to showcase their vision and portfolio. Migrated from a static single page to a responsive Jekyll site.",
      image: "/assets/images/inkoop.png",
      link: "https://github.com/dharanijayakanthan/inkoop.github.io/",
      github: "https://github.com/dharanijayakanthan/inkoop.github.io/"
    },
    {
      title: "OCTOCOMPLY",
      role: "JS Developer",
      tech: ["VueJS", "Bootstrap4", "HTML5", "CSS3", "Heroku", "Node"],
      description: "Project for a school to organize internal functions like lesson plans and attendance. Built using Vue.js and Firebase. Involved in creating and designing components and routes.",
      image: "/assets/images/octocomply.png",
      link: "http://octoc.herokuapp.com/#/"
    },
    {
      title: "DIGITAL OFFICE",
      role: "JS Developer",
      tech: ["VueJS", "Bootstrap4", "Firebase", "Node"],
      description: "Product for schools to automate and digitalize their admission process. Built using Vue JS and Firebase. Involved in building components for registration, profiles, and application management.",
      image: "/assets/images/tms1.png",
      link: ""
    }
  ];

  return (
    <div className="space-y-6">
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">The Lab</h1>
        <p className="text-gray-500">Experimental projects, side hustles, and open source contributions.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
