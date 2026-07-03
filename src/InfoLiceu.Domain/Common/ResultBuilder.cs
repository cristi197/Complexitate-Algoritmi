namespace InfoLiceu.Domain.Common;

public static class ResultBuilder
{
    public static Result Ok() => Result.Ok();
    public static Result<T> Ok<T>(T value) => Result<T>.Ok(value);
    public static Result Error(string message) => Result.Error(message);
    public static Result<T> Error<T>(string message) => Result<T>.Error(message);
    public static Result NotFound() => Result.NotFound();
    public static Result<T> NotFound<T>() => Result<T>.NotFound();

    public static Result AddError(this Result result, string message)
    {
        result.Errors.Add(message);
        return result;
    }
}
