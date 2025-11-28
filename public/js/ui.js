// Clase para manejar la interfaz de usuario
class NutritionUI {
    constructor() {
        this.elements = this.initializeElements();
        this.initializeEventListeners();
    }

    // Inicializar referencias a elementos DOM
    initializeElements() {
        return {
            searchForm: document.getElementById('search-form'),
            foodInput: document.getElementById('food-input'),
            servingSizeInput: document.getElementById('serving-size'),
            variantSelect: document.getElementById('variant-select'),
            searchBtn: document.getElementById('search-btn'),
            clearFormBtn: document.getElementById('clear-form-btn'),
            resultsContent: document.getElementById('results-content'),
            errorContainer: document.getElementById('error-container'),
            historyList: document.getElementById('history-cards'),            
            clearHistoryBtn: document.getElementById('clear-history-btn'),
            confirmModal: document.getElementById('confirm-modal'),
            cancelClearBtn: document.getElementById('cancel-clear-btn'),
            confirmClearBtn: document.getElementById('confirm-clear-btn')
        };
    }

    // Configurar event listeners
    initializeEventListeners() {
        this.elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Validación en tiempo real
        this.elements.foodInput.addEventListener('input', () => {
            this.validateForm();
        });

        // Botón limpiar campos
        this.elements.clearFormBtn.addEventListener('click', () => {
            this.clearForm();
        });

        // Botón borrar historial
        this.elements.clearHistoryBtn.addEventListener('click', () => {
            this.showClearConfirmation();
        });

        // Modal de confirmación
        this.elements.cancelClearBtn.addEventListener('click', () => {
            this.hideClearConfirmation();
        });

        this.elements.confirmClearBtn.addEventListener('click', () => {
            this.confirmClearHistory();
        });

        // Cerrar modal al hacer clic fuera
        this.elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmModal) {
                this.hideClearConfirmation();
            }
        });
    }

    // Manejar búsqueda
    async handleSearch() {
        const foodName = this.elements.foodInput.value.trim();
        const servingSize = this.elements.servingSizeInput.value || 100;
        const variant = this.elements.variantSelect ? this.elements.variantSelect.value : 'auto';

        if (!this.validateForm()) {
            return;
        }

        try {
            this.showLoading();
            const nutritionData = await nutritionApi.searchFood(foodName, servingSize, variant);
            this.displayResults(nutritionData);
            this.hideError();
            
            // Notificar a la aplicación principal para actualizar historial
            if (window.nutritionApp && nutritionData) {
                window.nutritionApp.addToHistory({
                    foodName: foodName,
                    servingSize: servingSize,
                    variant: variant,
                    calories: nutritionData.nf_calories || 0,
                    protein: nutritionData.nf_protein || 0,
                    carbs: nutritionData.nf_total_carbohydrate || 0,
                    fat: nutritionData.nf_total_fat || 0,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Validar formulario
    validateForm() {
        const foodName = this.elements.foodInput.value.trim();
        const isValid = foodName.length > 0;

        this.elements.searchBtn.disabled = !isValid;
        
        if (!isValid && foodName.length === 0) {
            this.elements.foodInput.setCustomValidity('Por favor, ingresa un alimento');
        } else {
            this.elements.foodInput.setCustomValidity('');
        }

        return isValid;
    }

    // Mostrar resultados
    displayResults(data) {
        const servingSize = this.elements.servingSizeInput.value || 100;
        
        this.elements.resultsContent.innerHTML = `
            <div class="results-header">
                <div>
                    <div class="food-name">${data.food_name}</div>
                    <div class="serving-size">Porción: ${servingSize}g</div>
                </div>
            </div>
            
            <div class="nutrition-facts">
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_calories}</div>
                    <div class="nutrition-label">Calorías</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_total_fat}g</div>
                    <div class="nutrition-label">Grasa Total</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_saturated_fat}g</div>
                    <div class="nutrition-label">Grasa Saturada</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_cholesterol}mg</div>
                    <div class="nutrition-label">Colesterol</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_sodium}mg</div>
                    <div class="nutrition-label">Sodio</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_total_carbohydrate}g</div>
                    <div class="nutrition-label">Carbohidratos</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_dietary_fiber}g</div>
                    <div class="nutrition-label">Fibra Dietética</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_sugars}g</div>
                    <div class="nutrition-label">Azúcares</div>
                </div>
                
                <div class="nutrition-item">
                    <div class="nutrition-value">${data.nf_protein}g</div>
                    <div class="nutrition-label">Proteína</div>
                </div>
            </div>
        `;
    }

    // Mostrar estado de carga
    showLoading() {
        this.elements.resultsContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Buscando información nutricional...</p>
            </div>
        `;
        
        this.elements.searchBtn.disabled = true;
        this.elements.searchBtn.textContent = 'Buscando...';
    }

    // Mostrar error
    showError(message) {
        this.elements.errorContainer.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${message}
            </div>
        `;
        this.elements.errorContainer.style.display = 'block';
        
        this.elements.searchBtn.disabled = false;
        this.elements.searchBtn.textContent = 'Buscar Información Nutricional';
        
        // Mostrar estado vacío en resultados
        this.showEmptyState();
    }

    // Ocultar error
    hideError() {
        this.elements.errorContainer.style.display = 'none';
        this.elements.searchBtn.disabled = false;
        this.elements.searchBtn.textContent = 'Buscar Información Nutricional';
    }

    // Mostrar estado vacío
    showEmptyState() {
        this.elements.resultsContent.innerHTML = `
            <div class="empty-state">
                <h3>Consulta información nutricional</h3>
                <p>Busca un alimento para ver sus valores nutricionales</p>
            </div>
        `;
    }

    // Actualizar historial con tarjetas
    updateHistory(history) {
        const historyContainer = document.getElementById('history-cards');
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        
        if (!historyContainer) {
            console.error('No se encontró el contenedor history-cards');
            return;
        }
        
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="history-empty">
                    <svg class="icon-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>No hay búsquedas recientes</h3>
                    <p>Las búsquedas que realices aparecerán aquí</p>
                </div>
            `;
            if (clearHistoryBtn) clearHistoryBtn.disabled = true;
            return;
        }
        
        if (clearHistoryBtn) clearHistoryBtn.disabled = false;
        
        // Limpiar el contenedor primero
        historyContainer.innerHTML = '';
        
        // Crear las tarjetas
        history.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.setAttribute('data-index', index);
            
            card.innerHTML = `
                <div class="history-card-header">
                    <h3 class="history-card-title">${this.escapeHtml(item.foodName)}</h3>
                    <span class="history-card-serving">${item.servingSize}g</span>
                </div>
                
                <div class="history-card-content">
                    <div class="history-card-nutrient">
                        <span class="nutrient-label">Calorías</span>
                        <span class="nutrient-value">${Math.round(item.calories || 0)}</span>
                    </div>
                    <div class="history-card-nutrient">
                        <span class="nutrient-label">Proteínas</span>
                        <span class="nutrient-value">${Math.round(item.protein || 0)}g</span>
                    </div>
                    <div class="history-card-nutrient">
                        <span class="nutrient-label">Carbohidratos</span>
                        <span class="nutrient-value">${Math.round(item.carbs || 0)}g</span>
                    </div>
                    <div class="history-card-nutrient">
                        <span class="nutrient-label">Grasas</span>
                        <span class="nutrient-value">${Math.round(item.fat || 0)}g</span>
                    </div>
                </div>
                
                <div class="history-card-footer">
                    <span class="history-card-date">${this.formatDate(item.timestamp)}</span>
                    <div class="history-card-actions">
                        <button class="btn-history-action btn-view" title="Ver detalles">
                            <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Ver
                        </button>
                        <button class="btn-history-action btn-delete" title="Eliminar">
                            <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
            
            // Agregar event listeners a los botones
            const viewBtn = card.querySelector('.btn-view');
            const deleteBtn = card.querySelector('.btn-delete');
            
            viewBtn.addEventListener('click', () => {
                this.loadHistoryItem(index);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.deleteHistoryItem(index);
            });
            
            historyContainer.appendChild(card);
        });
    }

    // Función auxiliar para formatear la fecha
    formatDate(timestamp) {
        // Asegurar que timestamp sea un número válido
        const date = new Date(parseInt(timestamp));
        
        if (isNaN(date.getTime())) {
            return 'Fecha no disponible';
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Función auxiliar para escapar HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Función para cargar un item del historial
    loadHistoryItem(index) {
        const history = window.nutritionApp ? window.nutritionApp.getHistory() : [];
        if (history[index]) {
            const item = history[index];
            // Llenar el formulario con los datos del historial
            this.elements.foodInput.value = item.foodName;
            this.elements.servingSizeInput.value = item.servingSize;
            if (this.elements.variantSelect) {
                this.elements.variantSelect.value = item.variant || 'auto';
            }
            
            // Disparar la búsqueda automáticamente
            this.handleSearch();
        }
    }

    // Función para eliminar un item individual del historial
    deleteHistoryItem(index) {
        if (window.nutritionApp) {
            const history = window.nutritionApp.getHistory();
            history.splice(index, 1);
            window.nutritionApp.saveHistory(history);
            window.nutritionApp.searchHistory = history;
            this.updateHistory(history);
            this.showTemporaryMessage('Búsqueda eliminada del historial', 'success');
        }
    }

    // Mostrar confirmación para borrar historial
    showClearConfirmation() {
        this.elements.confirmModal.style.display = 'flex';
        // Enfocar el botón de cancelar por seguridad
        setTimeout(() => {
            this.elements.cancelClearBtn.focus();
        }, 100);
    }

    // Ocultar confirmación
    hideClearConfirmation() {
        this.elements.confirmModal.style.display = 'none';
    }

    // Confirmar borrado del historial
    confirmClearHistory() {
        this.hideClearConfirmation();
        
        // Aplicar efecto eléctrico al botón
        this.applyElectricEffectToButton(this.elements.clearHistoryBtn);
        
        // Notificar a la aplicación principal
        if (window.nutritionApp) {
            window.nutritionApp.clearHistory();
        }
        
        // Mostrar mensaje de confirmación
        this.showTemporaryMessage('Historial borrado correctamente', 'success');
    }

    // Aplicar efecto eléctrico a un elemento
    applyElectricEffectToButton(button) {
        // Nuevo enfoque: usar overlay animado del propio botón (sin filtro SVG ni bordes dentados)
        const TOTAL = 3000; // duración total del efecto en ms
        const FADE = 700;   // duración del fade final en ms

        // Limpiar timers previos si existen
        if (button._electricTimers) {
            if (button._electricTimers.fadeTimer) clearTimeout(button._electricTimers.fadeTimer);
            if (button._electricTimers.endTimer) clearTimeout(button._electricTimers.endTimer);
            if (button._electricTimers.endTimerOnly) clearTimeout(button._electricTimers.endTimerOnly);
        }

        // Aplicar distorsión al botón entero (usa el filtro SVG definido en index.html)
        // Esta implementación no usa fade: el botón permanecerá distorsionado durante TOTAL ms
        button.classList.add('electric-btn-distort');

        // Forzar repaint antes de iniciar el periodo
        requestAnimationFrame(() => {});

        // Remover la distorsión exactamente después de TOTAL ms
        const endTimerOnly = setTimeout(() => {
            button.classList.remove('electric-btn-distort');
            // limpiar cualquier estilo inline residual
            button.style.filter = '';
            button.style.boxShadow = '';
            button.style.transition = '';
        }, TOTAL);

        // Guardar timers en el elemento para posibles cancelaciones posteriores
        button._electricTimers = { endTimerOnly };
    }

    // Mostrar mensaje temporal
    showTemporaryMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `temp-message temp-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 3000);
    }

    // Limpiar formulario
    clearForm() {
        this.elements.searchForm.reset();
        if (this.elements.variantSelect) this.elements.variantSelect.value = 'auto';
        this.elements.foodInput.focus();
        this.validateForm();
        this.showEmptyState();
        this.hideError();
    }
}

// Agregar estilos de animación para los mensajes temporales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .temp-message-success {
        background: #4CAF50 !important;
    }
    
    .temp-message-info {
        background: #2196F3 !important;
    }
`;
document.head.appendChild(style);
// Crear instancia global
const nutritionUI = new NutritionUI();