
import React, { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X,
  Radio,
  Phone,
  MapPin,
  Cpu, 
  Server, 
  Layers, 
  CheckCircle2, 
  Zap,
} from 'lucide-react';

import { PageID } from './types';
import { getPathFromPageId, getRouteFromPath } from './utils/routes';
import { SITE, HERO, PARTNERS, STATS, UI_CLASSES, NAV_CONFIG, ISO_DATA } from './data/constants';
import { Layout } from './components/layout/Layout';
import { LogoSymbol } from './components/LogoSymbol';
import { Brand } from './components/Brand';
import HeroSection from './components/hero/HeroSection';
import { ClientTrustBar } from './components/ClientTrustBar';
import { ServiceCard } from './components/ServiceCard';
import { ContactModal } from './components/ContactModal';
import { CountUp } from './components/CountUp';
import { Section } from './components/Section';
// Import portfolio data for the ImageAccordion
import { portfolioProjects } from './data/portfolioData';
import { CorporatePages } from './components/CorporatePages';
import { 
  InfrastructurePages, 
  InnovationPages, 
  ServicePages,
  ExcellencePages 
} from './components/PageSections';

import { MetaTags } from './components/MetaTags';
import TelecomPage from './pages/TelecomPage';
import ICTPage from './pages/ICTPage';
import PowerPage from './pages/PowerPage';
import MSPPage from './pages/MSPPage';
import AcademyPage from './pages/AcademyPage';
import { LegalPage } from './components/LegalPage';

interface AppProps {
  initialPage?: PageID;
  i18n?: any;
}

const App: React.FC<AppProps> = ({ initialPage = 'home', i18n: i18nProp }) => {
  const { t } = useTranslation(undefined, { i18n: i18nProp });
  const { t: heroT } = useTranslation('hero', { i18n: i18nProp });
  const initialRoute = (() => {
    if (initialPage !== 'home') {
      return { page: initialPage, openContact: false };
    }

    if (typeof window === 'undefined') {
      return { page: 'home' as PageID, openContact: false };
    }

    const route = getRouteFromPath(window.location.pathname);
    if (route.openContact) {
      return { page: 'home' as PageID, openContact: true };
    }
    return route;
   })();

    const [currentPage, setCurrentPage] = useState<PageID>(initialRoute.page);
    const [isContactOpen, setIsContactOpen] = useState(initialRoute.openContact ?? false);
    const [contactSubject, setContactSubject] = useState<string>('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const cleanupRef = useRef<(() => void) | null>(null);

   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const subject = params.get('subject');
     if (subject) {
       setContactSubject(subject);
       setIsContactOpen(true);
     }
    }, []);

 

   useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 30);
    const handlePopState = () => {
      const route = getRouteFromPath(window.location.pathname);
      if (route.openContact) {
        setIsContactOpen(true);
      } else {
        setCurrentPage(route.page);
        setIsContactOpen(false);
      }
    };

    window.addEventListener('scroll', h);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('scroll', h);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (page: PageID, hash?: string, routePath?: string) => {
    const path = routePath || getPathFromPageId(page);
    const route = getRouteFromPath(path);

    if (route.openContact) {
      setIsContactOpen(true);
      setIsMobileOpen(false);
      setActiveMenu(null);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', path);
      }
    } else {
      setCurrentPage(route.page);
      setIsContactOpen(false);
      setIsMobileOpen(false);
      setActiveMenu(null);

      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (hash && route.page === 'home') {
          setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    }
};
 
   // Initialize ImageAccordion for success stories
   useEffect(() => {
     // Only concerned with home page state
     if (currentPage !== 'home') {
       // Clean up if we were previously on home page
       if (cleanupRef.current) {
         cleanupRef.current();
         cleanupRef.current = null;
       }
       return; // Exit early for non-home pages
     }

     // We're on the home page - initialize ImageAccordion
     async function initAccordion() {
       try {
         // Clean up any existing instance first
         if (cleanupRef.current) {
           cleanupRef.current();
         }
         
         // Import initImageAccordion dynamically to avoid SSR issues
         const { initImageAccordion } = await import('./components/ImageAccordion');
         
         // Transform portfolio data to match ImageAccordionData format
         const accordionData = portfolioProjects
           .slice(0, 5) // Take first 5 projects as required
           .map(project => ({
             image: project.image,
             title: project.title,
             description: project.description,
             link: '/portfolio' // Link to portfolio page (kept for compatibility)
           }));
         
         // Initialize accordion with navigation callback
         cleanupRef.current = initImageAccordion('#image-accordion-container', accordionData, navigateTo);
       } catch (error) {
         console.error('Failed to initialize ImageAccordion:', error);
       }
     }
     
     initAccordion();
     
     // Cleanup for when leaving home page or component unmounts
     return () => {
       if (cleanupRef.current) {
         cleanupRef.current();
         cleanupRef.current = null;
       }
     };
   }, [currentPage]); // Critical: Re-run when page changes

   const renderContent = () => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": SITE.name,
      "url": "https://infine-th.com",
      "logo": "https://infine-th.com/logo.png",
      "description": heroT('heroSub'),
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Addis Ababa",
        "addressCountry": "Ethiopia"
      }
    };

    switch(currentPage) {
      case 'identity': return (
        <>
          <MetaTags title={t('nav.identity')} description="InfinEth Solutions Corporate Identity" />
          <CorporatePages.Identity onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'leadership': return (
        <>
          <MetaTags title={t('nav.leadership')} description="Our Leadership Team" />
          <CorporatePages.Leadership onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'board': return (
        <>
          <MetaTags title={t('nav.board')} description="Our Board of Directors" />
          <CorporatePages.Board onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'portfolio-detailed': return (
        <>
          <MetaTags title={t('nav.portfolio')} description="Our Project Portfolio" />
          <CorporatePages.Portfolio onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'portfolio': return (
        <>
          <MetaTags title={t('nav.portfolio')} description="Our Project Portfolio" />
          <CorporatePages.Portfolio onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'about': return (
        <>
          <MetaTags title={t('nav.identity')} description="InfinEth Solutions Corporate Identity" />
          <CorporatePages.Identity onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'presence': return (
        <>
          <MetaTags title={t('nav.presence')} description="Our Regional Presence" />
          <CorporatePages.Presence onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'telecom': return (
        <>
          <MetaTags title={t('common.services.telecom.title')} description={t('common.services.telecom.items', { returnObjects: true })[0]} />
          <InfrastructurePages.Telecom onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'telecommunications': return (
        <>
          <MetaTags title={t('common.services.telecom.title')} description={t('common.services.telecom.items', { returnObjects: true })[0]} />
          <TelecomPage onNavigate={navigateTo} />
        </>
      );
      case 'telecommunications_mobile_rollout': return (
        <>
          <MetaTags title="Mobile Telecom Rollout (RAN + Power)" description="Radio Access Network deployment integrated with telecom power infrastructure as a single turnkey scope." />
          <ServicePages.TelecommunicationsMobileRollout onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" currentPath="/telecommunications/mobile-rollout" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'telecommunications_fiber_optics': return (
        <>
          <MetaTags title="Fiber Optics" description="Long-haul and metropolitan fiber optic network design, installation, splicing, termination, testing and commissioning." />
          <ServicePages.TelecommunicationsFiberOptics onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/optical-tansmission-network.webp" gradientFallback="from-black/5 to-transparent" currentPath="/telecommunications/fiber-optics" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'telecommunications_tower_civil_works': return (
        <>
          <MetaTags title="Tower & Civil Works" description="Greenfield tower construction, rooftop installations, tower reinforcement and civil site preparation." />
          <ServicePages.TelecommunicationsTowerCivilWorks onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/ethio-telecom-tower-rollout.webp" gradientFallback="from-black/5 to-transparent" currentPath="/telecommunications/tower-civil-works" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'telecommunications_operations_maintenance': return (
        <>
          <MetaTags title="Operations & Maintenance (O&M)" description="Preventive and corrective maintenance contracts with SLA-based network support." />
          <ServicePages.TelecommunicationsOperationsMaintenance onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" currentPath="/telecommunications/operations-maintenance" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'telecommunications_warehouse_management': return (
        <>
          <MetaTags title="Warehouse Management" description="Equipment receiving, inspection, inventory tracking and asset management for telecom programs." />
          <ServicePages.TelecommunicationsWarehouseManagement 
            onBack={() => navigateTo('home')} 
            heroImage="/assets/images/hero/hero-telecom.webp"
            gradientFallback="from-black/5 to-transparent" 
            currentPath="/telecommunications/warehouse-management" 
            onNavigate={(path) => navigateTo('home', undefined, path)} 
          />
        </>
      );
case 'power_transmission_distribution': return (
  <>
    <MetaTags title="Transmission, Distribution & Substation" description="HV/MV transmission line construction, substations and distribution network rollout." />
    <ServicePages.PowerTransmissionDistribution onBack={() => navigateTo('power')} heroImage="/assets/images/portfolio/400-kv-tower.webp" gradientFallback="from-black/5 to-transparent" currentPath="/power/transmission-distribution" onNavigate={(path) => navigateTo('power', undefined, path)} />
  </>
);
case 'power_minigrid_systems': return (
  <>
    <MetaTags title="Minigrid Systems" description="Minigrid design, hybrid power systems, grid integration and community electrification." />
    <ServicePages.PowerMinigridSystems onBack={() => navigateTo('power')} heroImage="/assets/images/hero/power.webp" gradientFallback="from-black/5 to-transparent" currentPath="/power/minigrid-systems" onNavigate={(path) => navigateTo('power', undefined, path)} />
  </>
);
case 'power_backup_power': return (
  <>
    <MetaTags title="Backup Power Systems (DG, Solar & Hybrid)" description="Diesel generator, solar PV, battery storage and UPS systems for backup power." />
    <ServicePages.PowerBackupPower onBack={() => navigateTo('power')} heroImage="/assets/images/hero/power.webp" gradientFallback="from-black/5 to-transparent" currentPath="/power/backup-power" onNavigate={(path) => navigateTo('power', undefined, path)} />
  </>
);
case 'power_building_electromechanical': return (
  <>
    <MetaTags title="Building Electromechanical Works" description="Industrial electrical installations, panel boards, earthing and lightning protection systems." />
    <ServicePages.PowerBuildingElectromechanical onBack={() => navigateTo('power')} heroImage="/assets/images/hero/power.webp" gradientFallback="from-black/5 to-transparent" currentPath="/power/building-electromechanical" onNavigate={(path) => navigateTo('power', undefined, path)} />
  </>
);
      case 'ict_datacenter_data_center_design': return (
        <>
          <MetaTags title="Data Center Design & Build" description="Data center assessment, rack and cabling infrastructure, power and cooling systems." />
          <ServicePages.IctDatacenterDataCenterDesign onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/mofed-dc.webp" gradientFallback="from-black/5 to-transparent" currentPath="/ict-datacenter/data-center-design" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'ict_datacenter_enterprise_networking': return (
        <>
          <MetaTags title="Enterprise Networking, Storage & Backup" description="LAN/WAN design, structured cabling, storage and backup systems." />
          <ServicePages.IctDatacenterEnterpriseNetworking onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/entoto-tvet-1.webp" gradientFallback="from-black/5 to-transparent" currentPath="/ict-datacenter/enterprise-networking" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'ict_datacenter_system_development': return (
        <>
          <MetaTags title="System Development & Consultancy" description="System requirements analysis, software development and ICT project management." />
          <ServicePages.IctDatacenterSystemDevelopment onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-ict.webp" gradientFallback="from-black/5 to-transparent" currentPath="/ict-datacenter/system-development" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'ict_datacenter_cybersecurity_managed': return (
        <>
          <MetaTags title="Cybersecurity & Managed Services" description="Information security assessments, managed services and incident response support." />
          <ServicePages.IctDatacenterCybersecurityManaged onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-ict.webp" gradientFallback="from-black/5 to-transparent" currentPath="/ict-datacenter/cybersecurity-managed" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'ict_datacenter_training_consultancy': return (
        <>
          <MetaTags title="Training & ICT Consultancy" description="ICT training programs and consultancy services for enterprise and institutional clients." />
          <ServicePages.IctDatacenterTrainingConsultancy onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-ict.webp" gradientFallback="from-black/5 to-transparent" currentPath="/ict-datacenter/training-consultancy" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'academy_overview': return (
        <>
          <MetaTags title="Training Overview" description="InfinEth Training is Ethiopia's practitioner-led engineering and ICT training center." />
          <ServicePages.AcademyOverview onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-academy.webp" gradientFallback="from-black/5 to-transparent" currentPath="/academy/overview" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'academy_fiber_optics_certification': return (
        <>
          <MetaTags title="Fiber Optics Certification Programs (CFOT / CFOS)" description="FOA-aligned fiber optics certification programs for technicians and specialists." />
          <ServicePages.AcademyFiberOpticsCertification onBack={() => navigateTo('home')} heroImage="/assets/images/portfolio/Academy-practical-class.webp" gradientFallback="from-black/5 to-transparent" currentPath="/academy/fiber-optics-certification" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'academy_telecom_automation_training': return (
        <>
          <MetaTags title="Telecommunications & Industrial Automation Training" description="Telecom and industrial automation training programs for operators and engineers." />
          <ServicePages.AcademyTelecomAutomationTraining onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-academy.webp" gradientFallback="from-black/5 to-transparent" currentPath="/academy/telecom-automation-training" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
);
      case 'academy_institutional_partnerships': return (
        <>
          <MetaTags title="Institutional Partnerships" description="Corporate and institutional training partnerships" />
          <ServicePages.AcademyInstitutionalPartnerships onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-academy.webp" gradientFallback="from-black/5 to-transparent" currentPath="/academy/institutional-partnerships" onNavigate={(path) => navigateTo('home', undefined, path)} />
        </>
      );
      case 'consultancy': return (
        <>
          <MetaTags title={t('nav.consultancy')} description="Consultancy Services" />
          <ExcellencePages.Consultancy onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'ehs': return (
        <>
          <MetaTags title={t('nav.ehs')} description="Environmental Health & Safety" />
          <ExcellencePages.EHS onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
        </>
      );
      case 'privacy_policy': return (
        <>
          <MetaTags title="Privacy Policy" description="InfinEth Solutions Privacy Policy" />
          <LegalPage type="privacy" onNavigate={navigateTo} />
        </>
      );
       case 'terms_of_service': return (
         <>
           <MetaTags title="Terms of Service" description="InfinEth Solutions Terms of Service" />
           <LegalPage type="terms" onNavigate={navigateTo} />
         </>
       );
       case 'awards': return (
         <>
           <MetaTags title={t('excellence.awards.title')} description={t('excellence.awards.description')} />
           <ExcellencePages.Awards onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
         </>
       );
       case 'iso': return (
         <>
           <MetaTags title={t('excellence.iso.title')} description={t('excellence.iso.description')} />
           <ExcellencePages.ISO onBack={() => navigateTo('home')} heroImage="/assets/images/hero/hero-overview.webp" gradientFallback="from-black/5 to-transparent" />
         </>
       );
       case 'ict_datacenter': return (
        <>
          <MetaTags title={t('common.services.ict.title')} description={t('common.services.ict.description')} />
          <ICTPage onNavigate={navigateTo} />
        </>
      );
      case 'power': return (
        <>
          <MetaTags title={t('common.services.power.title')} description={t('common.services.power.description')} />
          <PowerPage onNavigate={navigateTo} />
        </>
      );
      case 'academy': return (
        <>
          <MetaTags title={t('nav.academy')} description="InfinEth Training - Practitioner-led training" />
          <AcademyPage onNavigate={navigateTo} />
        </>
      );
      case 'msp': return (
        <>
          <MetaTags title="Managed ICT Services" description="Ongoing IT and infrastructure managed services" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_overview': return (
        <>
          <MetaTags title="Managed Services Overview" description="Managed IT and infrastructure services" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_noc': return (
        <>
          <MetaTags title="Network Operations Center" description="24/7 NOC monitoring and management services" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_infrastructure': return (
        <>
          <MetaTags title="Infrastructure Management" description="Server, storage and network device management" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_cybersecurity': return (
        <>
          <MetaTags title="Managed Cybersecurity" description="Security monitoring and incident response" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_ict_connectivity': return (
        <>
          <MetaTags title="ICT & Connectivity" description="Enterprise networking, structured cabling, and managed support services" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_security_access': return (
        <>
          <MetaTags title="Security & Access Control" description="Smart CCTV surveillance and biometric access control systems" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_fire_safety': return (
        <>
          <MetaTags title="Fire Safety & Protection" description="Fire detection, suppression systems, and compliance monitoring" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_hvac': return (
        <>
          <MetaTags title="HVAC & Environmental Control" description="Climate management and Building Management System integration" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      case 'msp_power_energy': return (
        <>
          <MetaTags title="Power & Energy Solutions" description="UPS backup power and energy management solutions" />
          <MSPPage onNavigate={navigateTo} />
        </>
      );
      default: return (
        <>
          <MetaTags 
            title={SITE.name + " | " + SITE.tagline} 
            description={heroT('heroSub')}
            schema={organizationSchema}
          />
           <HeroSection onNavigate={navigateTo} />
           <div className="success-stories-header">
             <h2 className="success-stories-title">Our Success Stories</h2>
             <p className="success-stories-subtitle">Delivering excellence across Ethiopia's telecommunications, power, and ICT sectors</p>
           </div>
           <div id="image-accordion-container"></div>
           <ClientTrustBar />
          
          <Section className="bg-brand-primary overflow-hidden border-b border-white/5">
             <div className="mb-8 flex items-center gap-3"><LogoSymbol className="w-6 h-6 opacity-30" /><span className={UI_CLASSES.tag + " text-brand-muted/70 border-l-2 border-brand-accent pl-3"}>{t('common.strategicDeliveryNetwork')}</span></div>
             <div className="flex gap-20 items-center animate-marquee whitespace-nowrap opacity-[0.1] hover:opacity-[0.8] transition-opacity duration-700">{PARTNERS.concat(PARTNERS).map((n, i) => (<span key={i} className="text-sm md:text-base font-semibold text-brand-foreground tracking-tighter uppercase">{n.name}</span>))}</div>
</Section>
            
            <div className="w-16 h-px bg-brand-accent/30 mx-auto" />
            
<Section id="capabilities" className="bg-brand-primary py-10">
                <div className="flex flex-col lg:flex-row justify-between items-end mb-8 gap-4">
                  <div className="max-w-xl"><span className={`text-brand-accent ${UI_CLASSES.tag} mb-2 border-l-2 border-brand-accent pl-3`}>Core Capabilities</span><h2 className={`${UI_CLASSES.sectionTitle} text-brand-foreground text-lg`}>Engineering, ICT & Academy solutions for Ethiopia's growth.</h2></div>
                  <p className="text-sm text-gray-400 max-w-xs">Telecommunications, Power, ICT & Data Center, Academy & MSP.</p>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {NAV_CONFIG.filter(cat => cat.items.length > 0).slice(0, 3).map(cat => (
                      <ServiceCard
                        key={cat.label}
                        title={cat.label}
                        icon={cat.icon ?? Radio}
                        color="bg-brand-accent"
                        items={cat.items.slice(0, 2).map(item => item.label)}
                        onClick={() => navigateTo(cat.page as PageID, undefined, cat.path)}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-2/3 lg:mx-auto">
                    {NAV_CONFIG.filter(cat => cat.items.length > 0).slice(3, 5).map(cat => (
                      <ServiceCard
                        key={cat.label}
                        title={cat.label}
                        icon={cat.icon ?? Radio}
                        color="bg-brand-accent"
                        items={cat.items.slice(0, 2).map(item => item.label)}
                        onClick={() => navigateTo(cat.page as PageID, undefined, cat.path)}
                      />
                    ))}
                  </div>
</div>
             </Section>

            <div className="w-16 h-px bg-brand-accent/30 mx-auto" />

<Section id="excellence" className="bg-brand-primary overflow-hidden py-8">
               <div className="max-w-2xl mb-6"><span className={`text-brand-accent ${UI_CLASSES.tag} mb-2 border-l-2 border-brand-accent pl-3`}>Our Certifications</span><h2 className={`${UI_CLASSES.sectionTitle} text-brand-foreground text-lg`}>{t('common.integrityFramework')}</h2></div>
               <div className="bg-brand-surface rounded-xl overflow-hidden grid lg:grid-cols-3 shadow-lg">
                 <div className="lg:col-span-12 px-6 py-8">
                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                     {ISO_DATA.map((cert) => {
                       const statusVariants = {
                         certified: { 
                           bg: 'bg-green-500/20', 
                           border: 'border-green-500', 
                           label: 'Certified',
                           iconColor: 'text-green-600'
                         },
                         wip: { 
                           bg: 'bg-amber-500/20', 
                           border: 'border-amber-500', 
                           label: 'In Progress',
                           iconColor: 'text-amber-600'
                         },
                         rated: { 
                           bg: 'bg-blue-500/20', 
                           border: 'border-blue-500', 
                           label: 'Rated',
                           iconColor: 'text-blue-600'
                         }
   };

                       const variant = statusVariants[cert.status as keyof typeof statusVariants] || statusVariants.certified;
                       
                       return (
                         <div key={cert.id} className={`p-4 border rounded-lg ${variant.border}/20 hover:${variant.border}/40 transition-all duration-300`}>
                           <div className="flex items-start space-x-3">
                             <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-surface/50">
                               <CheckCircle2 className={`w-5 h-5 ${variant.iconColor}`} />
                             </div>
                             <div className="space-y-1">
                               <h3 className="font-semibold text-brand-foreground">{cert.standard}</h3>
                               <p className="text-sm text-brand-muted">{cert.title}</p>
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variant.bg}">${variant.label}</span>
                             </div>
                           </div>
                           <p className="mt-2 text-xs text-brand-muted">{cert.description}</p>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
               </Section>

            <div className="w-16 h-px bg-brand-accent/30 mx-auto" />

          <Section className="bg-brand-primary text-brand-foreground relative z-10 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
              {STATS.map((st, i) => (
                <div key={i}>
                  <div className="text-h2 font-bold tabular-nums mb-3 tracking-tight leading-none"><CountUp value={st.value} suffix={st.suffix || ""} /></div>
                  <p className="text-sm font-medium uppercase tracking-widest text-gray-400">{t(st.label)}</p>
                </div>
              ))}
            </div>
          </Section>
          
<Section className="bg-brand-surface text-center py-16 relative overflow-hidden">
            <div className="absolute inset-0">
              <img src="/assets/images/hero/telecom.webp" className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-surface/95 via-brand-surface/80 to-brand-surface/95" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Our Promise</p>
              <h2 className="text-xs font-light text-white/50 italic tracking-wider max-w-xl mb-6">{t('common.preciseEngineering')}</h2>
              <button 
                onClick={() => navigateTo('about')} 
                className="bg-brand-accent text-brand-primary px-10 py-4 rounded-xl font-semibold tracking-wide text-sm shadow-lg hover:bg-white hover:text-brand-primary active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-accent transition-all duration-200 uppercase"
              >
                {t('common.partnershipCta')}
              </button>
            </div>
           </Section>
        </>
      );
    }
  };

  const content = (
    <Layout currentPage={currentPage} navigateTo={navigateTo} isContactOpen={isContactOpen} setIsContactOpen={setIsContactOpen} contactSubject={contactSubject}>
      {renderContent()}
    </Layout>
  );

  if (i18nProp) {
    return (
      <ErrorBoundary>
        <I18nextProvider i18n={i18nProp}>
          {content}
        </I18nextProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  );
};

export { HelmetProvider };
export default App;
