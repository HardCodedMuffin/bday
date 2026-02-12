document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const card = document.querySelector(".card");
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isExpanded = false;

    // Open envelope on first click only
    container.addEventListener("click", (e) => {
        if (!container.classList.contains("opened") && e.target !== card && !card.contains(e.target)) {
            container.classList.add("opened");
            var hintEnvelope = document.getElementById("hint-click-envelope");
            var hintPull = document.getElementById("hint-pull-card");
            if (hintEnvelope) hintEnvelope.classList.add("hint--hidden");
            if (hintPull) hintPull.classList.remove("hint--hidden");
        }
    }, { once: false });

    // Make card draggable
    card.addEventListener("mousedown", (e) => {
        if (isExpanded) return; // Don't allow dragging when expanded
        isDragging = true;
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
            
            // Check if card is dragged back to original position (inside envelope)
            if (Math.abs(currentY) < 20) {
                // Close the envelope and reset everything
                resetEnvelope();
            } else if (Math.abs(currentY) > 50) {
                // Auto-expand when card is dragged far enough out
                setTimeout(() => {
                    expandCard();
                }, 300);
            }
        }
    });

    // Set initial cursor
    card.style.cursor = "grab";

    function expandCard() {
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
        container.classList.remove("opened");
        currentX = 0;
        currentY = 0;
        card.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
        card.style.cursor = "grab";
    }
});
