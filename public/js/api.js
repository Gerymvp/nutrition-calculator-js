// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'https://trackapi.nutritionix.com/v2',
    APP_ID: 'YOUR_APP_ID', // Reemplazar con tu App ID
    APP_KEY: 'YOUR_APP_KEY' // Reemplazar con tu App Key
};

// Servicio para manejar llamadas a la API
class NutritionApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'x-app-id': API_CONFIG.APP_ID,
            'x-app-key': API_CONFIG.APP_KEY
        };
        // Cargar base local de alimentos comunes (opcional)
        this.commonFoods = {};
        this._loadLocalFoods();
    }

    // Buscar alimento en la API
    async searchFood(foodName, servingSize = 100, variant = 'auto') {
        try {
            // En un entorno real, usaríamos la API de Nutritionix
            // Por ahora simulamos una respuesta con datos de ejemplo
            
            console.log(`Buscando: ${foodName}, Porción: ${servingSize}g, Variante: ${variant}`);
            
            // Simular tiempo de respuesta de la API
            await this.delay(1000);
            
            // Datos de ejemplo (simulando respuesta de API)
            return this.generateMockData(foodName, servingSize, variant);
            
            // Código real para Nutritionix API (comentado):
            /*
            const response = await fetch(`${this.baseUrl}/natural/nutrients`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    query: foodName,
                    timezone: 'US/Eastern'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.foods || data.foods.length === 0) {
                throw new Error('No se encontraron resultados para el alimento especificado');
            }
            
            return data.foods[0];
            */
            
        } catch (error) {
            console.error('Error en la búsqueda de alimento:', error);
            throw new Error(`No se pudo obtener la información nutricional: ${error.message}`);
        }
    }

    // Generar datos de ejemplo (para desarrollo)
    generateMockData(foodName, servingSize, variant = 'auto') {
        const baseData = this.getFoodBaseData(foodName, variant);
        const scale = servingSize / 100;
        
        return {
            food_name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
            serving_qty: 1,
            serving_unit: "g",
            serving_weight_grams: parseInt(servingSize),
            nf_calories: Math.round(baseData.calories * scale),
            nf_total_fat: (baseData.total_fat * scale).toFixed(1),
            nf_saturated_fat: (baseData.saturated_fat * scale).toFixed(1),
            nf_cholesterol: Math.round(baseData.cholesterol * scale),
            nf_sodium: Math.round(baseData.sodium * scale),
            nf_total_carbohydrate: (baseData.carbohydrates * scale).toFixed(1),
            nf_dietary_fiber: (baseData.fiber * scale).toFixed(1),
            nf_sugars: (baseData.sugars * scale).toFixed(1),
            nf_protein: (baseData.protein * scale).toFixed(1)
        };
    }

    // Obtener datos base de alimentos reales (valores por 100g)
    getFoodBaseData(foodName, variant = 'auto') {
        const normalizedName = this._normalizeText(String(foodName || '').toLowerCase());

        // Si se cargó la base local, buscar coincidencias por prioridad
        if (this.commonFoods && Object.keys(this.commonFoods).length > 0) {
            // 1) intento exacto
            if (this.commonFoods[normalizedName]) return this.commonFoods[normalizedName];

            // 2) si el usuario pidió variante, probar claves con variante
            if (variant === 'cooked' || variant === 'raw') {
                const cand1 = `${normalizedName} (cooked)`;
                const cand2 = `${normalizedName} (raw)`;
                if (this.commonFoods[cand1]) return this.commonFoods[cand1];
                if (this.commonFoods[cand2]) return this.commonFoods[cand2];
            }

            // 3) comprobar sinónimos cargados
            if (this.synonyms) {
                const syn = this.synonyms[normalizedName];
                if (syn) {
                    const s = this._normalizeText(String(syn).toLowerCase());
                    if (this.commonFoods[s]) return this.commonFoods[s];
                    if (this.commonFoods[`${s} (cooked)`]) return this.commonFoods[`${s} (cooked)`];
                    if (this.commonFoods[`${s} (raw)`]) return this.commonFoods[`${s} (raw)`];
                }
            }

            // 4) buscar por substring en keys (coincidencia parcial)
            for (const [key, data] of Object.entries(this.commonFoods)) {
                if (normalizedName.includes(key) || key.includes(normalizedName)) {
                    return data;
                }
            }
        }

        // Valor por defecto si no se encuentra el alimento
        return {
            calories: 100, total_fat: 3, saturated_fat: 1, cholesterol: 20,
            sodium: 50, carbohydrates: 15, fiber: 1.5, sugars: 5, protein: 5
        };
    }

    // Cargar archivo local JSON con alimentos comunes (03-assets/data/common-foods.json)
    async _loadLocalFoods() {
        try {
            const resp = await fetch('assets/data/common-foods.json');
            if (!resp.ok) return;
            const json = await resp.json();
            // Normalizar keys a lowercase para búsquedas fáciles
            const normalized = {};
            for (const [k, v] of Object.entries(json)) {
                normalized[this._normalizeText(k.toLowerCase())] = v;
            }
            this.commonFoods = normalized;
            console.log('Base local de alimentos cargada:', Object.keys(this.commonFoods).length, 'items');
        } catch (err) {
            // No bloquear si no existe el archivo
            console.warn('No se pudo cargar base local de alimentos:', err.message);
        }
        // Cargar sinónimos (si existe)
        try {
            const resp2 = await fetch('assets/data/synonyms.json');
            if (resp2 && resp2.ok) {
                const syn = await resp2.json();
                const normalizedSyn = {};
                for (const [k, v] of Object.entries(syn)) {
                    normalizedSyn[this._normalizeText(k.toLowerCase())] = v;
                }
                this.synonyms = normalizedSyn;
                console.log('Sinónimos cargados:', Object.keys(this.synonyms).length);
            }
        } catch (err) {
            console.warn('No se pudo cargar sinónimos de alimentos:', err.message);
        }
    }

    // Normalizar texto: eliminar tildes y colapsar espacios
    _normalizeText(text) {
        if (!text) return '';
        try {
            const noDiacritics = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
            return noDiacritics.replace(/[\\/,]/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (e) {
            // Fallback simple
            return text.replace(/[\\/,]/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    // Simular delay de red
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Validar configuración de API
    validateConfig() {
        if (API_CONFIG.APP_ID === 'YOUR_APP_ID' || API_CONFIG.APP_KEY === 'YOUR_APP_KEY') {
            console.warn('⚠️  Configuración de API no válida. Por ahora usara datos locales.');
            return false;
        }
        return true;
    }
}

// Instancia única del servicio
const nutritionApi = new NutritionApiService();