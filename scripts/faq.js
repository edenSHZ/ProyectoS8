// FAQ Acordeón
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const pregunta = item.querySelector('.faq-pregunta');
        
        pregunta.addEventListener('click', () => {
            // Cerrar otros items abiertos (opcional)
            // faqItems.forEach(otherItem => {
            //     if (otherItem !== item && otherItem.classList.contains('active')) {
            //         otherItem.classList.remove('active');
            //     }
            // });
            
            // Toggle el item actual
            item.classList.toggle('active');
        });
    });
});