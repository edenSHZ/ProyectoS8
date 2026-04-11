
(function() {
    'use strict';

    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        
        // Referencias al formulario
        const formulario = document.querySelector('.contacto-form');
        
        // Si no existe el formulario, salir
        if (!formulario) return;
        
        // Obtener campos del formulario
        const campos = {
            nombre: document.getElementById('nombre'),
            telefono: document.getElementById('telefono'),
            email: document.getElementById('email'),
            asunto: document.getElementById('asunto'),
            mensaje: document.getElementById('mensaje')
        };
        
        // Verificar que todos los campos existan
        for (let campo in campos) {
            if (!campos[campo]) {
                console.error(`Campo no encontrado: ${campo}`);
                return;
            }
        }
        
        // Obtener botón de envío
        const btnEnviar = formulario.querySelector('.btn-enviar');
        
        // Obtener o crear contenedor de mensajes (usando textContent para evitar XSS)
        let mensajeContainer = document.querySelector('.form-mensaje');
        if (!mensajeContainer) {
            mensajeContainer = document.createElement('div');
            mensajeContainer.className = 'form-mensaje';
            mensajeContainer.setAttribute('role', 'alert');
            mensajeContainer.setAttribute('aria-live', 'polite');
            formulario.appendChild(mensajeContainer);
        }
        
        // Obtener token CSRF (se genera en el servidor)
        obtenerTokenCSRF();
        
        // Agregar validación en tiempo real
        configurarValidacionEnTiempoReal(campos);
        
        // Manejar envío del formulario
        formulario.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Limpiar mensajes anteriores
            limpiarMensajes(campos);
            ocultarMensaje(mensajeContainer);
            
            // Validar todos los campos
            const errores = validarFormulario(campos);
            
            // Si hay errores, mostrarlos y no enviar
            if (Object.keys(errores).length > 0) {
                mostrarErrores(campos, errores);
                mostrarMensajeError(mensajeContainer, 'Por favor corrige los errores del formulario.');
                return;
            }
            
            // Deshabilitar botón y mostrar estado de carga
            btnEnviar.disabled = true;
            const textoOriginal = btnEnviar.textContent;
            btnEnviar.textContent = 'Enviando...';
            
            try {
                // Sanitizar datos antes de enviar (prevención XSS)
                const datosFormulario = sanitizarDatos({
                    nombre: campos.nombre.value.trim(),
                    telefono: campos.telefono.value.trim(),
                    email: campos.email.value.trim(),
                    asunto: campos.asunto.value.trim(),
                    mensaje: campos.mensaje.value.trim(),
                    csrf_token: sessionStorage.getItem('csrf_token') || ''
                });
                
                // Enviar datos al servidor
                const respuesta = await enviarFormulario(datosFormulario);
                
                if (respuesta.success) {
                    // Éxito: mostrar mensaje y limpiar formulario
                    mostrarMensajeExito(mensajeContainer, respuesta.message);
                    limpiarFormulario(campos);
                    
                    // Scroll al mensaje de éxito
                    mensajeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Error del servidor
                    mostrarMensajeError(mensajeContainer, respuesta.message);
                    
                    // Si hay errores específicos de campos, mostrarlos
                    if (respuesta.data && respuesta.data.errores) {
                        mostrarErrores(campos, respuesta.data.errores);
                    }
                }
                
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                mostrarMensajeError(mensajeContainer, 
                    'Ocurrió un error al enviar el mensaje. Por favor intenta más tarde.');
            } finally {
                // Restaurar botón
                btnEnviar.disabled = false;
                btnEnviar.textContent = textoOriginal;
                
                // Obtener nuevo token CSRF para el siguiente envío
                obtenerTokenCSRF();
            }
        });
        
        /**
         * Obtiene un token CSRF del servidor
         */
        async function obtenerTokenCSRF() {
            try {
                const response = await fetch('/php/procesar_contacto.php?action=get_csrf', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.csrf_token) {
                        sessionStorage.setItem('csrf_token', data.csrf_token);
                        
                        // Agregar campo oculto al formulario si no existe
                        let tokenInput = formulario.querySelector('input[name="csrf_token"]');
                        if (!tokenInput) {
                            tokenInput = document.createElement('input');
                            tokenInput.type = 'hidden';
                            tokenInput.name = 'csrf_token';
                            formulario.appendChild(tokenInput);
                        }
                        tokenInput.value = data.csrf_token;
                    }
                }
            } catch (error) {
                console.warn('No se pudo obtener token CSRF:', error);
            }
        }
        
        /**
         * Valida el formulario completo
         * @param {Object} campos - Objeto con referencias a los campos
         * @returns {Object} - Objeto con errores por campo
         */
        function validarFormulario(campos) {
            const errores = {};
            
            // Validar nombre
            const nombre = campos.nombre.value.trim();
            if (!nombre) {
                errores.nombre = 'El nombre es obligatorio';
            } else if (nombre.length < 3) {
                errores.nombre = 'El nombre debe tener al menos 3 caracteres';
            } else if (nombre.length > 100) {
                errores.nombre = 'El nombre no puede exceder los 100 caracteres';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]+$/.test(nombre)) {
                errores.nombre = 'El nombre contiene caracteres no permitidos';
            }
            
            // Validar teléfono (opcional)
            const telefono = campos.telefono.value.trim();
            if (telefono) {
                const telefonoLimpio = telefono.replace(/[^0-9+]/g, '');
                if (telefonoLimpio.length < 10 || telefonoLimpio.length > 15) {
                    errores.telefono = 'El teléfono debe tener entre 10 y 15 dígitos';
                }
            }
            
            // Validar email
            const email = campos.email.value.trim();
            if (!email) {
                errores.email = 'El correo electrónico es obligatorio';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errores.email = 'El correo electrónico no es válido';
            } else if (email.length > 100) {
                errores.email = 'El correo no puede exceder los 100 caracteres';
            }
            
            // Validar asunto
            const asunto = campos.asunto.value.trim();
            if (!asunto) {
                errores.asunto = 'El asunto es obligatorio';
            } else if (asunto.length < 3) {
                errores.asunto = 'El asunto debe tener al menos 3 caracteres';
            } else if (asunto.length > 150) {
                errores.asunto = 'El asunto no puede exceder los 150 caracteres';
            }
            
            // Validar mensaje
            const mensaje = campos.mensaje.value.trim();
            if (!mensaje) {
                errores.mensaje = 'El mensaje es obligatorio';
            } else if (mensaje.length < 10) {
                errores.mensaje = 'El mensaje debe tener al menos 10 caracteres';
            }
            
            return errores;
        }
        
        /**
         * Configura validación en tiempo real
         * @param {Object} campos - Objeto con referencias a los campos
         */
        function configurarValidacionEnTiempoReal(campos) {
            // Validar al perder el foco
            for (let [nombre, campo] of Object.entries(campos)) {
                campo.addEventListener('blur', function() {
                    const errores = validarFormulario(campos);
                    if (errores[nombre]) {
                        mostrarErrorCampo(campo, errores[nombre]);
                    } else {
                        limpiarErrorCampo(campo);
                    }
                });
                
                // Limpiar error al empezar a escribir
                campo.addEventListener('input', function() {
                    limpiarErrorCampo(campo);
                });
            }
        }
        
        /**
         * Muestra un error en un campo específico
         * @param {HTMLElement} campo - Campo del formulario
         * @param {string} mensaje - Mensaje de error
         */
        function mostrarErrorCampo(campo, mensaje) {
            campo.classList.add('error');
            campo.setAttribute('aria-invalid', 'true');
            
            // Buscar o crear elemento de error
            let errorElement = campo.parentElement.querySelector('.error-mensaje');
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-mensaje';
                errorElement.setAttribute('role', 'alert');
                campo.parentElement.appendChild(errorElement);
            }
            // Usar textContent previene XSS
            errorElement.textContent = mensaje;
        }
        
        /**
         * Limpia el error de un campo específico
         * @param {HTMLElement} campo - Campo del formulario
         */
        function limpiarErrorCampo(campo) {
            campo.classList.remove('error');
            campo.setAttribute('aria-invalid', 'false');
            
            const errorElement = campo.parentElement.querySelector('.error-mensaje');
            if (errorElement) {
                errorElement.remove();
            }
        }
        
        /**
         * Muestra múltiples errores en los campos
         * @param {Object} campos - Objeto con referencias a los campos
         * @param {Object} errores - Objeto con errores por campo
         */
        function mostrarErrores(campos, errores) {
            for (let [campo, mensaje] of Object.entries(errores)) {
                if (campos[campo]) {
                    mostrarErrorCampo(campos[campo], mensaje);
                }
            }
        }
        
        /**
         * Limpia todos los mensajes de error
         * @param {Object} campos - Objeto con referencias a los campos
         */
        function limpiarMensajes(campos) {
            for (let campo of Object.values(campos)) {
                limpiarErrorCampo(campo);
            }
        }
        
        /**
         * Muestra mensaje de éxito (usando textContent para prevenir XSS)
         * @param {HTMLElement} container - Contenedor del mensaje
         * @param {string} mensaje - Mensaje a mostrar
         */
        function mostrarMensajeExito(container, mensaje) {
            container.className = 'form-mensaje mensaje-exito';
            container.setAttribute('role', 'status');
            container.textContent = mensaje; // textContent previene XSS
            container.style.display = 'block';
        }
        
        /**
         * Muestra mensaje de error (usando textContent para prevenir XSS)
         * @param {HTMLElement} container - Contenedor del mensaje
         * @param {string} mensaje - Mensaje a mostrar
         */
        function mostrarMensajeError(container, mensaje) {
            container.className = 'form-mensaje mensaje-error';
            container.setAttribute('role', 'alert');
            container.textContent = mensaje; // textContent previene XSS
            container.style.display = 'block';
        }
        
        /**
         * Oculta el contenedor de mensajes
         * @param {HTMLElement} container - Contenedor del mensaje
         */
        function ocultarMensaje(container) {
            container.style.display = 'none';
            container.textContent = '';
        }
        
        /**
         * Sanitiza los datos del formulario (prevención XSS)
         * @param {Object} datos - Datos a sanitizar
         * @returns {Object} - Datos sanitizados
         */
        function sanitizarDatos(datos) {
            const sanitizado = {};
            
            for (let [clave, valor] of Object.entries(datos)) {
                if (typeof valor === 'string') {
                    // Escapar caracteres HTML especiales
                    sanitizado[clave] = valor
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                } else {
                    sanitizado[clave] = valor;
                }
            }
            
            return sanitizado;
        }
        
        /**
         * Envía el formulario al servidor
         * @param {Object} datos - Datos del formulario
         * @returns {Promise<Object>} - Respuesta del servidor
         */
        async function enviarFormulario(datos) {
            // Crear FormData
            const formData = new FormData();
            for (let [clave, valor] of Object.entries(datos)) {
                formData.append(clave, valor);
            }
            
            const response = await fetch('/php/procesar_contacto.php', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        }
        
        /**
         * Limpia el formulario
         * @param {Object} campos - Objeto con referencias a los campos
         */
        function limpiarFormulario(campos) {
            for (let campo of Object.values(campos)) {
                campo.value = '';
                campo.classList.remove('error');
                campo.setAttribute('aria-invalid', 'false');
            }
        }
    });
    
})();