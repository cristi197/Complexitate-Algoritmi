using System.Text.Json;
using System.Text.RegularExpressions;
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

    public async Task<IActionResult> OnGet(string slug)
    {
        var chapter = await _chapterService.GetBySlugAsync(slug);
        if (chapter is null) return NotFound();

        Chapter = chapter;
        Slides = ParseSlides(chapter.ContentJson);
        TotalSlides = Slides.Count;
        CurrentIndex = 0;
        CurrentSlide = Slides.Count > 0 ? Slides[0] : null;

        return Page();
    }

    /// <summary>
    /// Renders body text with simple formatting: **bold**, `code`, lists, tables.
    /// </summary>
    public string RenderBody(string body)
    {
        if (string.IsNullOrEmpty(body)) return string.Empty;

        var result = new System.Text.StringBuilder();
        var paragraphs = body.Split("\n\n");

        foreach (var paragraph in paragraphs)
        {
            var trimmed = paragraph.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;

            if (trimmed.StartsWith("|") && !trimmed.Contains("---", StringComparison.Ordinal))
            {
                // Table
                var rows = trimmed.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                result.Append("<div class='overflow-x-auto my-4'><table class='w-full text-sm border-collapse'>");
                for (int r = 0; r < rows.Length; r++)
                {
                    var cells = rows[r].Split('|', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(c => c.Trim()).ToArray();
                    var rowClass = r == 0 ? "font-semibold bg-[var(--color-bg-sidebar)]" : "";
                    result.Append($"<tr class='border-b border-[var(--color-border)] {rowClass}'>");
                    foreach (var cell in cells)
                        result.Append($"<td class='px-3 py-2'>{FormatInline(cell)}</td>");
                    result.Append("</tr>");
                }
                result.Append("</table></div>");
            }
            else if (trimmed.StartsWith("- ") || trimmed.StartsWith("* "))
            {
                // Unordered list
                result.Append("<ul class='list-disc pl-6 my-2 space-y-1'>");
                foreach (var line in trimmed.Split('\n'))
                {
                    var item = line.TrimStart('-', '*', ' ');
                    result.Append($"<li>{FormatInline(item)}</li>");
                }
                result.Append("</ul>");
            }
            else
            {
                result.Append($"<p class='my-2 leading-relaxed'>{FormatInline(paragraph.Replace("\n", "<br/>"))}</p>");
            }
        }

        return result.ToString();
    }

    private static string FormatInline(string text)
    {
        text = Regex.Replace(text, @"\*\*(.+?)\*\*", "<strong>$1</strong>");
        text = Regex.Replace(text, @"`([^`]+)`", "<code class='px-1.5 py-0.5 bg-[var(--color-bg-sidebar)] rounded text-sm font-mono text-[var(--color-primary)]'>$1</code>");
        return text;
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
