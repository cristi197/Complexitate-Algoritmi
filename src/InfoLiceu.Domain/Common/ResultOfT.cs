namespace InfoLiceu.Domain.Common;

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(ResultStatus status) : base(status) { }

    public Result(T value) : base(ResultStatus.Ok)
    {
        Value = value;
    }

    public static Result<T> Ok(T value) => new(value);
    public static new Result<T> Error(string message) => new(ResultStatus.Error) { Errors = { message } };
    public static new Result<T> NotFound() => new(ResultStatus.NotFound);
}
