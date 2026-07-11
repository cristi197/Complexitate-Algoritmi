using System.Text.Json;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace InfoLiceu.Web.Pages.Capitole;

public class DetailModel : PageModel
{
    private readonly IChapterService _chapterService;

    public ChapterDto? Chapter { get; set; }
    public List<SlideDto> Slides { get; set; } = [];
    public SlideDto? CurrentSlide { get; set; }
    public int CurrentIndex { get; set; }
    public int TotalSlides { get; set; }
    public bool HasPrev => CurrentIndex > 0;
    public bool HasNext => CurrentIndex < TotalSlides - 1;

    public DetailModel(IChapterService chapterService)
    {
        _chapterService = chapterService;
    }

    public async Task<IActionResult> OnGet(string slug, int? index)
    {
        var chapter = await _chapterService.GetBySlugAsync(slug);
        if (chapter is null) return NotFound();

        Chapter = chapter;
        Slides = ParseSlides(chapter.ContentJson);
        TotalSlides = Slides.Count;

        var slideIdx = Math.Clamp(index ?? 0, 0, TotalSlides - 1);
        CurrentIndex = slideIdx;
        CurrentSlide = Slides.Count > 0 ? Slides[slideIdx] : null;

        return Page();
    }

    /// <summary>
    /// HTMX handler: returnează doar conținutul slide-ului curent (partial view).
    /// </summary>
    public async Task<IActionResult> OnGetSlide(string slug, int index)
    {
        var chapter = await _chapterService.GetBySlugAsync(slug);
        if (chapter is null) return NotFound();

        var slides = ParseSlides(chapter.ContentJson);
        if (index < 0 || index >= slides.Count)
            return BadRequest("Slide index out of range.");

        CurrentIndex = index;
        CurrentSlide = slides[index];
        TotalSlides = slides.Count;

        return Partial("_SlideContent", this);
    }

    private static List<SlideDto> ParseSlides(string contentJson)
    {
        try
        {
            return JsonSerializer.Deserialize<List<SlideDto>>(contentJson) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
