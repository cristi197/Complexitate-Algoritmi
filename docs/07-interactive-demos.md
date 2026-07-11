# 07 — Demo-uri Interactive (View Components + HTMX)

> **Faza implementare**: Faza 3 — Demo-uri interactive
> **Dependențe**: HTMX, Razor ViewComponents

---

## Concept

Fiecare demo JS actual din versiunea Astro devine un **View Component** server-side + HTMX.
Serverul face calculele, HTMX face update-uri parțiale fără reload.

---

## Exemplu: Fibonacci DP Demo

### ViewComponent (C#)

```csharp
// FibonacciDPDemo.cs
public class FibonacciDPDemo : ViewComponent
{
    public IViewComponentResult Invoke(int n = 5)
        => View(new FibModel { N = n, Rows = CalcTable(n) });
}
```

### Template Razor

```html
@* Default.cshtml *@
<input type="number" name="n" value="@Model.N" min="1" max="25"
       hx-get="/Demo/FibStep" hx-target="#fib-table" hx-trigger="change">

<div id="fib-table" hx-get="/Demo/FibStep" hx-trigger="load" hx-include="[name=n]">
    @foreach (var row in Model.Rows) { <div class="cell">@row</div> }
</div>
```

### Endpoint demo (PageModel)

```csharp
public class FibStepModel : PageModel
{
    public IActionResult OnGet(int n)
        => ViewComponent("FibonacciDPDemo", new { n });
}
```

---

## Lista completă de demo-uri

| Demo | ViewComponent | Tip interacțiune |
|------|--------------|-----------------|
| Bubble Sort | `BubbleSortDemo` | HTMX step-by-step |
| N-Queens | `NQueensDemo` | HTMX + Canvas |
| Fibonacci DP | `FibonacciDPDemo` | HTMX table update |
| Pointer Memory | `MemoryPointerDemo` | HTMX visualization |
| File I/O | `FileIODemo` | HTMX code + output |
| Struct Sorter | `StructSorter` | HTMX form submit |
| Graph Builder | `GraphBuilder` | Canvas JS interop |
| Binary Search | `BinarySearchDemo` | HTMX step-by-step |
| Matrix Multiplication | `MatrixMultiplyDemo` | HTMX table update |
| Stack/Queue | `StackQueueDemo` | HTMX push/pop |
| Linked List | `LinkedListDemo` | HTMX node animation |
| Hash Table | `HashTableDemo` | HTMX insert/lookup |
| BST Operations | `BSTDemo` | Canvas JS interop |
| Dijkstra | `DijkstraDemo` | Canvas JS interop |
| Prim/Kruskal | `MSTDemo` | Canvas JS interop |
| Huffman Coding | `HuffmanDemo` | HTMX tree build |
| LCS (DP) | `LCSDemo` | HTMX table update |

---

## Pattern standard pentru un demo

```
1. ViewComponent.cs — logica de business (calcule)
2. Default.cshtml   — template-ul Razor
3. DemoPage.cshtml  — pagina care conține demo-ul + endpoint HTMX
4. ⚡ HTMX           — update-uri parțiale fără reload
```

---

## 🔗 Documente conexe

- [00-overview.md](./00-overview.md) — Structura proiectului (folder ViewComponents)
- [08-migration-plan.md](./08-migration-plan.md) — Plan migrare demo-uri din Astro
