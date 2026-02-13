document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const card = document.querySelector(".card");
    let isDragging = false;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isExpanded = false;
    let isRead = false;

    // --- Helper to get coordinates from either Mouse or Touch ---
    const getPos = (e) => {
        return {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY
        };
    };

    // --- START DRAGGING ---
    const onStart = (e) => {
        if (isExpanded) return;
        isDragging = true;
        card.style.transition = "none";
        
        const pos = getPos(e);
        startX = pos.x - currentX;
        startY = pos.y - currentY;
        
        card.style.cursor = "grabbing";
        const hintPull = document.getElementById("hint-pull-card");
        if (hintPull) hintPull.classList.add("hint--hidden");
    };

    // --- DRAGGING MOVE ---
    const onMove = (e) => {
        if (!isDragging) return;
        
        // Prevent mobile from scrolling while dragging the card
        if (e.cancelable) e.preventDefault(); 

        const pos = getPos(e);
        currentY = pos.y - startY;
        currentY = Math.min(currentY, 0); // Only allow upward movement
        currentX = 0;
        
        card.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.92)`;
    };

    // --- END DRAGGING ---
    const onEnd = () => {
        if (isDragging) {
            isDragging = false;
            card.style.cursor = "grab";
            
            // Logic for snapping back or expanding
            if (!isExpanded && isRead && Math.abs(currentY) < 20) { 
                resetEnvelope();
            } 
            else if (Math.abs(currentY) > 50) {
                setTimeout(() => { expandCard(); }, 100);
            } 
            else if (!isExpanded && !isRead) {
                card.style.transition = "transform 0.3s ease";
                currentY = -40; 
                card.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.92)`;
            }
        }
    };

    // Mouse Listeners
    card.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);

    // Touch Listeners (Mobile)
    card.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    // Open envelope on first click/tap
    container.addEventListener("click", (e) => {
        if (!container.classList.contains("opened") && e.target !== card && !card.contains(e.target)) {
            container.classList.add("opened");
            var hintEnvelope = document.getElementById("hint-click-envelope");
            var hintPull = document.getElementById("hint-pull-card");
            if (hintEnvelope) hintEnvelope.classList.add("hint--hidden");
            if (hintPull)
                setTimeout(() => {
                    hintPull.classList.remove("hint--hidden");
                }, 2000);
        }
    });

    // Make card draggable
    card.addEventListener("mousedown", (e) => {
        if (isExpanded) return; // Don't allow dragging when expanded
        isDragging = true;
        card.style.transition = "none";
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        card.style.cursor = "grabbing";
        var hintPull = document.getElementById("hint-pull-card");
        if (hintPull) hintPull.classList.add("hint--hidden");
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        // Only allow upward movement (negative Y)
        currentY = e.clientY - startY;
        currentY = Math.min(currentY, 0); // Restrict to upward only (negative values)
        currentX = 0; // No horizontal movement
        
        card.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.92)`;
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            card.style.cursor = "grab";
            
            if (!isExpanded && isRead && Math.abs(currentY) < 20) { 
                resetEnvelope();
            } 
            else if (Math.abs(currentY) > 50) {
                setTimeout(() => {
                    expandCard();
                }, 300);
            } 
            else if (!isExpanded && !isRead) {
                // FORCE TRANSITION HERE TOO
                card.style.transition = "transform 0.3s ease";
                currentY = -40; 
                card.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
    });

    // Set initial cursor
    card.style.cursor = "grab";

    function expandCard() {
        isRead = true;
        isExpanded = true;
        container.classList.add("card-expanded");
        card.style.left = "";
        card.style.top = "";
        card.style.transform = "";
        card.classList.add("expanded");
        var hintPull = document.getElementById("hint-pull-card");
        if (hintPull) hintPull.classList.add("hint--hidden");
        card.addEventListener("click", closeCard, { once: true });
    }

    function closeCard() {
        isExpanded = false;
        currentX = 0;
        currentY = -200;
        card.classList.remove("expanded");
        container.classList.remove("card-expanded");
        card.style.left = "15px";
        card.style.top = "5px";
        card.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.92)`;
        card.style.cursor = "grab";
        // Allow dragging again
        card.addEventListener("mousedown", (e) => {
            if (!isExpanded) {
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                card.style.cursor = "grabbing";
            }
        });
    }

    function resetEnvelope() {
        isRead = false;
        isExpanded = false;
    
        // 1. Remove the classes
        container.classList.remove("opened");
        container.classList.remove("card-expanded");
    
        // 2. Clear manual dragging styles
        // We set these to empty strings so the browser uses the values in the CSS file
        card.style.top = "";
        card.style.left = "";
        card.style.transition = "all 0.8s ease-in-out";
        
        // Reset transform to the starting point
        card.style.transform = "translate(0, 0) scale(0.92)";
    
        // Show the hint again
        setTimeout(() => {
            const hintEnvelope = document.getElementById("hint-click-envelope");
            if (hintEnvelope) hintEnvelope.classList.remove("hint--hidden");
        }, 1000);
    }
});
