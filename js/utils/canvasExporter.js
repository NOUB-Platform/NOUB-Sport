/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/utils/canvasExporter.js
 * Version: Noub Sports_beta 2.5.0
 * Status: Production Ready
 */

export class CanvasExporter {
    static exportBoard(container, filename = 'noub-sports-tactic.png') {
        const width = 1000;
        const height = 1600; 
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 1. Pitch background
        const turfGradient = ctx.createLinearGradient(0, 0, 0, height);
        turfGradient.addColorStop(0, "#256b44");
        turfGradient.addColorStop(1, "#1e5233");
        ctx.fillStyle = turfGradient;
        ctx.fillRect(0, 0, width, height);

        // Stripes
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        const stripeHeight = 80;
        for (let y = 0; y < height; y += stripeHeight * 2) {
            ctx.fillRect(0, y, width, stripeHeight);
        }

        // 2. Pitch Geometry
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";

        const margin = 50; 
        const playWidth = width - (margin * 2);
        const playHeight = height - (margin * 2);

        ctx.strokeRect(margin, margin, playWidth, playHeight);

        const midX = width / 2;
        const midY = height / 2;

        ctx.beginPath();
        ctx.moveTo(margin, midY);
        ctx.lineTo(width - margin, midY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(midX, midY, 110, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();

        const boxWidth = 600;
        const boxHeight = 250;
        
        ctx.strokeRect((width - boxWidth) / 2, margin, boxWidth, boxHeight);
        ctx.strokeRect((width - boxWidth) / 2, height - margin - boxHeight, boxWidth, boxHeight);

        const spotDistance = 200;
        ctx.beginPath(); 
        ctx.arc(midX, margin + spotDistance, 8, 0, 2 * Math.PI); 
        ctx.fill();
        
        ctx.beginPath(); 
        ctx.arc(midX, height - margin - spotDistance, 8, 0, 2 * Math.PI); 
        ctx.fill();

        const arcRadius = 30;
        ctx.beginPath(); ctx.arc(margin, margin, arcRadius, 0, 0.5 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(width - margin, margin, arcRadius, 0.5 * Math.PI, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(margin, height - margin, arcRadius, 1.5 * Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(width - margin, height - margin, arcRadius, Math.PI, 1.5 * Math.PI); ctx.stroke();

        // 3. Entity Rendering
        const rect = container.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        
        const items = container.querySelectorAll('.draggable-item');

        items.forEach(el => {
            const r = el.getBoundingClientRect();
            const cx = (r.left - rect.left + r.width / 2) * scaleX;
            const cy = (r.top - rect.top + r.height / 2) * scaleY;

            if (el.classList.contains('tactic-token')) {
                const isGold = el.classList.contains('token-gold');
                const isGK = el.classList.contains('is-gk');
                const radius = 40;
                
                const grad = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, radius);
                if (isGold) {
                    grad.addColorStop(0, "#ffd700");
                    grad.addColorStop(1, "#b8860b");
                } else {
                    grad.addColorStop(0, "#ff6b6b");
                    grad.addColorStop(1, "#cc0000");
                }
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = isGK ? "#000000" : "#ffffff";
                ctx.lineWidth = isGK ? 8 : 4;
                ctx.stroke();

                ctx.fillStyle = isGold ? "#332200" : "#ffffff";
                ctx.font = "900 35px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(el.innerText, cx, cy + 4);
            }
            else if (el.classList.contains('tool-ball')) {
                const ballGrad = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 22);
                ballGrad.addColorStop(0, "#ffffff");
                ballGrad.addColorStop(0.4, "#dddddd");
                ballGrad.addColorStop(1, "#111111");
                
                ctx.fillStyle = ballGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (el.classList.contains('tool-cone')) {
                ctx.fillStyle = "#ff9100";
                ctx.beginPath();
                ctx.moveTo(cx, cy - 25);
                ctx.lineTo(cx + 25, cy + 25);
                ctx.lineTo(cx - 25, cy + 25);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = "#cc7400";
                ctx.fillRect(cx - 30, cy + 25, 60, 8);
            }
            else if (el.classList.contains('tool-arrow')) {
                const rotationDeg = parseFloat(el.dataset.rotation || 0);
                const angleRad = rotationDeg * Math.PI / 180;
                
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angleRad);
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-45, -6, 60, 12);
                
                ctx.beginPath();
                ctx.moveTo(15, -18);
                ctx.lineTo(55, 0);
                ctx.lineTo(15, 18);
                ctx.fill();
                
                ctx.restore();
            }
        });

        // 4. Branding
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "900 40px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText("NOUB SPORTS", width - 40, height - 40); 
        ctx.restore();

        // 5. Download
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
