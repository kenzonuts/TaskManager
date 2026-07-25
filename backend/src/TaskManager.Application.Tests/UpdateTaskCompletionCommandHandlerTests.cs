using Moq;
using TaskManager.Application.TaskItem.Command.Update;
using TaskManager.Domain.Repositories;
using DomainTask = TaskManager.Domain.Data.TaskItem;

namespace TaskManager.Application.Tests;

public class UpdateTaskCompletionCommandHandlerTests
{
    [Fact]
    public async Task Handle_MarkComplete_SetsCompletedAtAndUpdatedAt()
    {
        var userId = Guid.NewGuid();
        var taskId = Guid.NewGuid();
        var task = new DomainTask
        {
            TaskId = taskId,
            Title = "Ship it",
            UserId = userId,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            CompletedAt = null
        };

        var taskRepo = new Mock<IRepositoryTaskItem>();
        taskRepo.Setup(r => r.GetByIdAsync(taskId)).ReturnsAsync(task);
        taskRepo.Setup(r => r.UpdateAsync(It.IsAny<DomainTask>())).Returns(Task.CompletedTask);

        var handler = new UpdateTaskCompletionCommandHandler(
            taskRepo.Object,
            TestHttp.ForUser(userId));

        await handler.Handle(
            new UpdateTaskCompletionCommand { TaskId = taskId, IsCompleted = true },
            CancellationToken.None);

        Assert.True(task.IsCompleted);
        Assert.NotNull(task.CompletedAt);
        Assert.True(task.UpdatedAt >= task.CreatedAt);
        taskRepo.Verify(r => r.UpdateAsync(task), Times.Once);
    }

    [Fact]
    public async Task Handle_MarkIncomplete_ClearsCompletedAt()
    {
        var userId = Guid.NewGuid();
        var taskId = Guid.NewGuid();
        var task = new DomainTask
        {
            TaskId = taskId,
            Title = "Ship it",
            UserId = userId,
            IsCompleted = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            CompletedAt = DateTime.UtcNow.AddDays(-1)
        };

        var taskRepo = new Mock<IRepositoryTaskItem>();
        taskRepo.Setup(r => r.GetByIdAsync(taskId)).ReturnsAsync(task);
        taskRepo.Setup(r => r.UpdateAsync(It.IsAny<DomainTask>())).Returns(Task.CompletedTask);

        var handler = new UpdateTaskCompletionCommandHandler(
            taskRepo.Object,
            TestHttp.ForUser(userId));

        await handler.Handle(
            new UpdateTaskCompletionCommand { TaskId = taskId, IsCompleted = false },
            CancellationToken.None);

        Assert.False(task.IsCompleted);
        Assert.Null(task.CompletedAt);
        taskRepo.Verify(r => r.UpdateAsync(task), Times.Once);
    }
}
