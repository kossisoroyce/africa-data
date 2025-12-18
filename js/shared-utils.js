/**
 * AfricaData Shared Utilities
 * Version: 1.0.0
 * Provides common functionality across all pages
 */

(function() {
    'use strict';

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !expanded);
                navLinks.classList.toggle('active');
            });
        }
    }

    // ============================================
    // Back to Top Button
    // ============================================
    function initBackToTop() {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // Data Export Functions
    // ============================================
    window.AfricaData = window.AfricaData || {};

    window.AfricaData.exportTableToCSV = function(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const rowData = [];
            cols.forEach(col => {
                let text = col.textContent.replace(/"/g, '""');
                rowData.push(`"${text}"`);
            });
            csv.push(rowData.join(','));
        });

        const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'data.csv';
        link.click();
    };

    window.AfricaData.exportDataToJSON = function(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'data.json';
        link.click();
    };

    // ============================================
    // Share Functionality
    // ============================================
    window.AfricaData.share = async function(options = {}) {
        const { title, text, url } = {
            title: document.title,
            text: document.querySelector('meta[name="description"]')?.content || '',
            url: window.location.href,
            ...options
        };

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!');
            } catch (err) {
                console.error('Copy failed:', err);
            }
        }
    };

    // ============================================
    // Toast Notifications
    // ============================================
    function showToast(message, duration = 3000) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-bg-elevated, #252a33);
            color: var(--color-text-primary, #f4f4f5);
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 500;
            animation: fadeInUp 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    window.AfricaData.showToast = showToast;

    // ============================================
    // Print Function
    // ============================================
    window.AfricaData.print = function() {
        window.print();
    };

    // ============================================
    // Theme Toggle
    // ============================================
    window.AfricaData.toggleTheme = function() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    function initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    // ============================================
    // Intersection Observer for Animations
    // ============================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ============================================
    // Chart.js Default Configuration
    // ============================================
    // Define colors immediately (not in init) so they're available right away
    window.AfricaData.chartColors = {
        gold: '#d4a853',
        teal: '#2dd4bf',
        coral: '#f97316',
        rose: '#f43f5e',
        blue: '#3b82f6',
        purple: '#a855f7',
        green: '#10b981'
    };
    
    function initChartDefaults() {
        if (typeof Chart === 'undefined') return;

        Chart.defaults.color = '#a1a1aa';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
        Chart.defaults.font.family = "'Source Sans 3', sans-serif";
    }

    // ============================================
    // Table Sort Functionality
    // ============================================
    window.AfricaData.initSortableTable = function(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            
            const sortHandler = () => {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const isAsc = header.classList.contains('sort-asc');
                
                // Reset other headers
                headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                
                rows.sort((a, b) => {
                    const aVal = a.cells[index].textContent.trim();
                    const bVal = b.cells[index].textContent.trim();
                    
                    // Try numeric sort first
                    const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
                    const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
                    
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return isAsc ? aNum - bNum : bNum - aNum;
                    }
                    
                    // Fallback to string sort
                    return isAsc 
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                });
                
                header.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
                rows.forEach(row => tbody.appendChild(row));
            };

            header.addEventListener('click', sortHandler);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sortHandler();
                }
            });
        });
    };

    // ============================================
    // Initialize on DOM Ready
    // ============================================
    function init() {
        initTheme();
        initMobileNav();
        initBackToTop();
        initScrollAnimations();
        initChartDefaults();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
