// Script de inicialización del efecto eléctrico
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const githubBtn = document.getElementById('github-btn');
        const body = document.body;
        const panels = document.querySelectorAll('.electric-card');

        if (githubBtn) {
            githubBtn.addEventListener('click', () => {
                const isActive = body.classList.toggle('electric-active');
                
                // Cambiar apariencia del botón según estado
                if (isActive) {
                    githubBtn.style.background = 'linear-gradient(135deg, #52C77A, #5FD068)';
                    githubBtn.style.boxShadow = '0 0 20px rgba(82, 199, 122, 0.8)';
                    githubBtn.textContent = 'ON';
                    githubBtn.style.fontSize = '12px';
                } else {
                    githubBtn.style.background = '';
                    githubBtn.style.boxShadow = '';
                    githubBtn.textContent = 'G';
                    githubBtn.style.fontSize = '18px';
                }
                
                console.log(`Efecto Eléctrico: ${isActive ? 'Activado' : 'Desactivado'}`);

                if (window.nutritionApp && window.nutritionApp.ui && window.nutritionApp.ui.showMessage) {
                    window.nutritionApp.ui.showMessage(`Efecto Eléctrico: ${isActive ? 'Activado' : 'Desactivado'}`, 'info');
                }
            });
        }

        // Agregar interactividad a los paneles
        panels.forEach(panel => {
            panel.addEventListener('mouseenter', function() {
                if (body.classList.contains('electric-active')) {
                    this.style.transform = 'scale(1.01)';
                }
            });

            panel.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    });
})();
