/**
 * Utilidades para manipulación del DOM
 * Provee funciones helpers para operaciones comunes
 */
export class DomUtils {

    /**
     * Crea un elemento HTML con atributos y contenido opcional
     * @param {string} tag - Nombre del tag (div, span, button, etc)
     * @param {Object} attributes - Objeto con atributos (className, id, etc)
     * @param {string} textContent - Texto interno opcional
     * @returns {HTMLElement}
     */
    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        if (textContent) element.textContent = textContent;
        
        return element;
    }

    /**
     * Limpia todo el contenido hijo de un elemento
     * @param {HTMLElement} element 
     */
    static clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Retorna un elemento por ID asegurando que no sea nulo (lanza error si no existe)
     * Útil para fail-fast en componentes críticos
     * @param {string} id 
     * @returns {HTMLElement}
     */
    static getRequiredElement(id) {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Elemento requerido del DOM no encontrado: #${id}`);
        }
        return el;
    }
}