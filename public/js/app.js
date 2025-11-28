// Aplicación principal de la Calculadora de Nutrición
class NutritionCalculatorApp {
    constructor() {
        this.ui = new NutritionUI();
        this.searchHistory = this.loadHistory();
        this.initializeApp();
    }

    // Inicializar la aplicación
    initializeApp() {
        console.log('🚀 Calculadora de Nutrición inicializada');
        
        // Verificar configuración de API
        nutritionApi.validateConfig();
        
        // Cargar historial en la UI
        this.ui.updateHistory(this.searchHistory);
        
        // Exponer métodos públicos para la UI
        window.nutritionApp = this;
    }

    // Cargar historial desde localStorage
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('nutritionHistory')) || [];
        } catch (error) {
            console.error('Error cargando historial:', error);
            return [];
        }
    }

    // Guardar historial en localStorage
    saveHistory(history = this.searchHistory) {
        try {
            localStorage.setItem('nutritionHistory', JSON.stringify(history));
            this.searchHistory = history; // Actualizar la referencia local
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    // Añadir al historial (nueva versión con datos completos)
    addToHistory(nutritionData) {
        const historyItem = {
            foodName: nutritionData.foodName,
            servingSize: nutritionData.servingSize,
            variant: nutritionData.variant || 'auto',
            calories: nutritionData.calories || 0,
            protein: nutritionData.protein || 0,
            carbs: nutritionData.carbs || 0,
            fat: nutritionData.fat || 0,
            timestamp: nutritionData.timestamp || Date.now()
        };
        
        // Evitar duplicados recientes (mismo alimento y porción en los últimos 5 minutos)
        const recentDuplicate = this.searchHistory.find(item => 
            item.foodName.toLowerCase() === nutritionData.foodName.toLowerCase() && 
            item.servingSize === nutritionData.servingSize &&
            (Date.now() - item.timestamp) < 300000 // 5 minutos
        );
        
        if (!recentDuplicate) {
            this.searchHistory.unshift(historyItem);
            
            // Mantener solo las últimas 20 búsquedas
            if (this.searchHistory.length > 20) {
                this.searchHistory = this.searchHistory.slice(0, 20);
            }
            
            // Guardar y actualizar UI
            this.saveHistory();
            this.ui.updateHistory(this.searchHistory);
        } else {
            // Si es duplicado reciente, moverlo al inicio
            const index = this.searchHistory.findIndex(item => 
                item.foodName.toLowerCase() === nutritionData.foodName.toLowerCase() && 
                item.servingSize === nutritionData.servingSize
            );
            if (index > -1) {
                const [existingItem] = this.searchHistory.splice(index, 1);
                existingItem.timestamp = Date.now(); // Actualizar timestamp
                this.searchHistory.unshift(existingItem);
                this.saveHistory();
                this.ui.updateHistory(this.searchHistory);
            }
        }
    }

    // Obtener historial actual
    getHistory() {
        return this.searchHistory;
    }

    // Limpiar historial
    clearHistory() {
        this.searchHistory = [];
        this.saveHistory();
        this.ui.updateHistory(this.searchHistory);
    }

    // Obtener estadísticas de uso
    getUsageStats() {
        return {
            totalSearches: this.searchHistory.length,
            uniqueFoods: new Set(this.searchHistory.map(item => item.foodName.toLowerCase())).size,
            lastSearch: this.searchHistory[0] ? this.formatSimpleDate(this.searchHistory[0].timestamp) : 'Nunca'
        };
    }

    // Formatear fecha simple para estadísticas
    formatSimpleDate(timestamp) {
        const date = new Date(parseInt(timestamp));
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new NutritionCalculatorApp();
});

// Manejar errores no capturados
window.addEventListener('error', function(e) {
    console.error('Error no capturado:', e.error);
});

// Exportar para uso en otros módulos (si se usa bundler)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NutritionCalculatorApp };
}