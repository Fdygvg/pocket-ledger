import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import {
    Github,
    Twitter,
    Heart,
    Mail,
    Shield,
    Code,
    Coffee,
    FileText,
    Globe,
    Zap,
    Lock,
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { name: 'Features', href: '/features' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'API', href: '/api' },
            { name: 'Status', href: '/status' },
        ],
        Company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Press', href: '/press' },
        ],
        Legal: [
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'Security', href: '/security' },
            { name: 'Cookies', href: '/cookies' },
        ],
        Support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'Guides', href: '/guides' },
            { name: 'Community', href: '/community' },
        ],
    };

    const technologies = [
        { name: 'React', icon: <Zap className="h-3 w-3" />, color: 'text-blue-500' },
        { name: 'TypeScript', icon: <Code className="h-3 w-3" />, color: 'text-blue-600' },
        { name: 'Node.js', icon: <Globe className="h-3 w-3" />, color: 'text-green-500' },
        { name: 'Tailwind', icon: <Zap className="h-3 w-3" />, color: 'text-cyan-500' },
    ];

    return (
        <footer className="bg-background border-t">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="PocketLedger Logo" className="h-10 w-auto" />
                            </Link>
                            <div>
                                <span className="text-2xl font-bold">
                                    Pocket<span className="text-primary">Ledger</span>
                                </span>
                                <p className="text-sm text-muted-foreground">Personal Finance, Simplified</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            A privacy-first expense tracker built for individuals who value control,
                            simplicity, and security in their financial management.
                        </p>

                        {/* Tech Stack */}
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">Built with</p>
                            <div className="flex flex-wrap gap-2">
                                {technologies.map((tech) => (
                                    <Badge key={tech.name} variant="outline" className="gap-1">
                                        <span className={tech.color}>{tech.icon}</span>
                                        {tech.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="mailto:hello@pocketledger.app">
                                    <Mail className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-lg mb-4">{category}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            <span>Your data stays private</span>
                        </div>
                        <div className="hidden md:block">•</div>
                        <div className="flex items-center gap-1">
                            <Lock className="h-4 w-4" />
                            <span>End-to-end encryption</span>
                        </div>
                        <div className="hidden md:block">•</div>
                        <div className="flex items-center gap-1">
                            <Coffee className="h-4 w-4" />
                            <span>No tracking, ever</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/changelog">
                                <FileText className="h-4 w-4 mr-2" />
                                Changelog
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="https://github.com/sponsors" target="_blank" rel="noopener noreferrer">
                                <Heart className="h-4 w-4 mr-2 text-red-500" />
                                Sponsor
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="bg-muted/50 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span>© {currentYear} PocketLedger. A personal project.</span>
                            <Badge variant="secondary" className="text-xs">
                                v1.0.0
                            </Badge>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-foreground transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/cookies" className="hover:text-foreground transition-colors">
                                Cookie Policy
                            </Link>
                            <div className="flex items-center gap-1">
                                <span>Made with</span>
                                <Heart className="h-3 w-3 text-red-500" />
                                <span>by you</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;