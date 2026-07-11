using InfoLiceu.Domain.DTOs;

namespace InfoLiceu.Domain.Services;

/// <summary>
/// Serviciu pentru gestionarea quiz-urilor interactive:
/// start quiz, submit răspuns per întrebare, rezultat final.
/// Starea quiz-ului este stocată în cache (nu în DB) pe durata sesiunii.
/// </summary>
public interface IQuizService
{
    /// <summary>
    /// Inițiază un quiz pentru un capitol dat. Selectează întrebări random.
    /// </summary>
    /// <param name="chapterId">ID-ul capitolului</param>
    /// <param name="questionCount">Numărul de întrebări (default 5)</param>
    /// <param name="userId">ID-ul utilizatorului</param>
    /// <param name="ct">Token de anulare</param>
    /// <returns>Răspuns cu prima întrebare, sau eroare dacă nu există exerciții</returns>
    Task<QuizStartResponseDto?> StartQuizAsync(int chapterId, int questionCount, Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Trimite răspunsul pentru o întrebare din quiz și returnează următoarea întrebare.
    /// </summary>
    /// <param name="quizId">ID-ul quiz-ului activ</param>
    /// <param name="exerciseId">ID-ul exercițiului curent</param>
    /// <param name="answer">Răspunsul utilizatorului</param>
    /// <param name="ct">Token de anulare</param>
    /// <returns>Rezultatul răspunsului + următoarea întrebare (sau null dacă e ultima)</returns>
    Task<QuizAnswerResultDto?> SubmitAnswerAsync(string quizId, int exerciseId, string answer, CancellationToken ct = default);

    /// <summary>
    /// Finalizează quiz-ul și returnează rezultatul complet. Salvează QuizAttempt în DB.
    /// </summary>
    /// <param name="quizId">ID-ul quiz-ului</param>
    /// <param name="ct">Token de anulare</param>
    /// <returns>Rezultatul final al quiz-ului, sau null dacă quiz-ul nu există</returns>
    Task<QuizResultDto?> GetResultsAsync(string quizId, CancellationToken ct = default);
}
