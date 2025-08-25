// JavaScript pour les quiz interactifs
document.addEventListener('DOMContentLoaded', function() {
    initQuizzes();
});

function initQuizzes() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            handleQuizAnswer(this);
        });
    });
}

function handleQuizAnswer(selectedOption) {
    const quizSection = selectedOption.closest('.quiz-section');
    const allOptions = quizSection.querySelectorAll('.quiz-option');
    const isCorrect = selectedOption.dataset.correct === 'true';
    
    // Désactiver tous les choix
    allOptions.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Marquer la réponse sélectionnée
    selectedOption.classList.add('selected');
    
    // Afficher le résultat
    setTimeout(() => {
        showQuizResult(selectedOption, allOptions, isCorrect);
    }, 300);
}

function showQuizResult(selectedOption, allOptions, isCorrect) {
    allOptions.forEach(option => {
        const optionIsCorrect = option.dataset.correct === 'true';
        
        if (optionIsCorrect) {
            option.style.borderColor = '#22c55e';
            option.style.backgroundColor = '#f0fdf4';
            option.style.color = '#166534';
        } else if (option === selectedOption && !isCorrect) {
            option.style.borderColor = '#ef4444';
            option.style.backgroundColor = '#fef2f2';
            option.style.color = '#dc2626';
        }
    });
    
    // Feedback
    const feedback = document.createElement('div');
    feedback.style.marginTop = '1rem';
    feedback.style.padding = '1rem';
    feedback.style.borderRadius = '6px';
    feedback.style.fontSize = '0.9rem';
    
    if (isCorrect) {
        feedback.innerHTML = '🎉 <strong>Correct !</strong> Vous maîtrisez ce concept.';
        feedback.style.background = '#f0fdf4';
        feedback.style.color = '#166534';
        feedback.style.border = '1px solid #22c55e';
    } else {
        feedback.innerHTML = '❌ <strong>Pas tout à fait.</strong> La bonne réponse est surlignée en vert.';
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#dc2626';
        feedback.style.border = '1px solid #ef4444';
    }
    
    selectedOption.closest('.quiz-section').appendChild(feedback);
}
