// Validación del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactoForm');
    const checkbox = document.getElementById('privacidad');
    const btnEnviar = document.getElementById('btnEnviar');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Verificar que el checkbox esté marcado
            if (!checkbox.checked) {
                e.preventDefault();
                alert('Debes aceptar el Aviso de Privacidad para enviar el formulario.');
                checkbox.focus();
                // Agregar clase de error visual
                checkbox.closest('.checkbox-group').classList.add('error');
                return false;
            }
            
            // Quitar clase de error si existe
            checkbox.closest('.checkbox-group').classList.remove('error');
            
            // Aquí puedes agregar el código para enviar el formulario
            // Por ahora solo mostramos un mensaje
            e.preventDefault();
            alert('Mensaje enviado correctamente. Pronto nos pondremos en contacto contigo.');
            form.reset();
        });
        
        // Quitar error cuando el usuario marca el checkbox
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    this.closest('.checkbox-group').classList.remove('error');
                }
            });
        }
    }
});