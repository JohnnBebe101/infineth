import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Radio, Zap, Building2 } from 'lucide-react';
import { portfolioProjects } from '../data/portfolioData';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { PageID } from '../types';

interface SuccessStoriesSectionProps {
  onNavigate?: (page: PageID, hash?: string, routePath?: string) => void;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({ onNavigate }) => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [animatedItems, setAnimatedItems] = useState<number[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting && !animatedItems.includes(index)) {
          setAnimatedItems(prev => [...prev, index]);
        }
      });
    });

    const items = document.querySelectorAll('.success-stories-panel');
    items.forEach((item, index) => {
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, [animatedItems]);

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate('portfolio', undefined, '/portfolio');
    }
  };

  const handlePanelClick = (index: number) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <section 
      ref={ref}
      className={`py-20 bg-brand-primary transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-foreground mb-4">
            Our Success Stories
          </h2>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            Delivering excellence across Ethiopia's telecommunications, power, and ICT sectors
          </p>
        </div>

        {/* Horizontal Accordion Container */}
        <div className="success-stories-accordion relative overflow-hidden">
          <div className="flex-1 flex-nowrap transition-all duration-500">
            {portfolioProjects.slice(0, 6).map((project, index) => {
               const isExpanded = expandedIndex === index;
               const flexGrow = isExpanded ? 5 : 1; // Expanded panel takes 5x space, others 1x
              
              return (
                <div 
                  key={project.id}
                  ref={(el) => { panelRefs.current[index] = el; }}
                  className={`success-stories-panel flex-shrink-0 flex flex-col bg-brand-surface/50 hover:cursor-pointer transition-all duration-500 ${isExpanded ? 'expanded' : ''}`}
                  style={{ flexGrow }}
                  onClick={() => handlePanelClick(index)}
                >
                  {/* Background Image with Gradient Overlay */}
                  <div className="panel-image-wrapper relative flex-1 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="object-cover w-full h-full transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 to-transparent"></div>
                  </div>
                  
                  {/* Panel Content - Hidden by default, revealed when expanded */}
                  <div className="panel-content p-6 flex flex-col flex-1 overflow-hidden">
                    {/* Title (always visible) */}
                    <div className="panel-title mb-2 text-center text-white font-semibold text-sm">
                      {project.title}
                    </div>
                    
                    {/* Expanded Content - Hidden until panel expands */}
                    <div className={`expanded-content opacity-0 translate-y-4 transition-opacity transition-duration duration-500 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {/* Icon */}
                      <div className="mb-4 flex items-center justify-center">
                        {/* Dynamic icon based on category */}
                        {project.category === 'Telecom' && <Radio className="h-6 w-6 text-brand-accent" />}
                        {project.category === 'Power' && <Zap className="h-6 w-6 text-brand-accent" />}
                        {project.category === 'ICT' && <Building2 className="h-6 w-6 text-brand-accent" />}
                      </div>
                      
                      {/* Subtitle */}
                      <h3 className="mb-3 text-center text-white font-semibold text-lg">
                        {project.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="mb-4 text-center text-white/90 text-base leading-relaxed max-w-xs mx-auto">
                        {project.description}
                      </p>
                      
                      {/* Client Info */}
                      <p className="text-center text-white/70 text-sm font-semibold">
                        Client: {project.client}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-10">
          <button onClick={handleViewAll} className="text-brand-accent font-semibold text-lg inline-flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            View All Projects <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};