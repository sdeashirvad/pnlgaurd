import { FileText, ArrowRight } from 'lucide-react';
import { NavActionButton } from './NavActionButton';

export function Navbar() {
  const handleResumeDownload = () => {
    // Assuming the file is in the public folder
    const link = document.createElement('a');
    link.href = '/Resume_Ashirvad_Kumar_Pandey.pdf';
    link.download = 'Resume_Ashirvad_Kumar_Pandey.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePortfolioClick = () => {
    window.open('https://portfolio.ashirvad.work', '_blank');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <img
                src="/pnl-gaurd-ai-logo.png"
                alt="PnLGuard AI Logo"
                className="w-10 h-10 object-contain scale-125"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              PnLGuard <span className="text-blue-600">AI</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <NavActionButton
              label="Resume"
              icon={FileText}
              variant="secondary"
              onClick={handleResumeDownload}
            />

            <NavActionButton
              label="Portfolio"
              icon={ArrowRight}
              variant="primary"
              onClick={handlePortfolioClick}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
