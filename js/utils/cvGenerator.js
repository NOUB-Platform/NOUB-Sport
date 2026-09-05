/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/utils/cvGenerator.js
 * Version: 1.1.0
 * Description: Generates CV Image.
 */

export class CVGenerator {
    static async downloadCV(elementId, filename = 'noub-scout-report.png') {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error("CV Error: Source element not found.");
            return;
        }

        const rect = element.getBoundingClientRect();
        const width = Math.round(rect.width + 40);
        const height = Math.round(rect.height + 60);

        const clone = element.cloneNode(true);
        clone.style.margin = '20px auto'; 
        clone.style.transform = 'none'; 
        clone.style.boxShadow = '0 0 0 4px #D4AF37'; 
        clone.style.borderRadius = '22px';
        
        const overlay = clone.querySelector('.card-actions-overlay');
        if (overlay) overlay.remove();

        const htmlContent = new XMLSerializer().serializeToString(clone);

        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="background-color:#0f1014; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; padding-top:10px; font-family: 'Cairo', sans-serif;">
                        ${htmlContent}
                        <div style="margin-top:15px; color:#D4AF37; font-size:12px; font-weight:bold; letter-spacing:2px;">NOUB SPORTS OFFICIAL ID</div>
                    </div>
                </foreignObject>
            </svg>
        `;

        const img = new Image();
        img.crossOrigin = "anonymous"; 
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = "#0f1014";
            ctx.fillRect(0, 0, width, height);
            
            try {
                ctx.drawImage(img, 0, 0);
                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.warn("Canvas Export fallback:", err);
                alert("تم تجهيز الكارت! على بعض الأجهزة المحمولة يمكنك أخذ لقطة شاشة (Screenshot) لحفظه بأعلى دقة.");
            }
            
            URL.revokeObjectURL(url);
        };

        img.src = url;
    }
}
