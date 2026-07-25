using Moq;
using TaskManager.Application.Category.Command.Delete;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;
using DomainCategory = TaskManager.Domain.Data.Category;
using DomainTask = TaskManager.Domain.Data.TaskItem;

namespace TaskManager.Application.Tests;

public class DeleteCategoryCommandHandlerTests
{
    [Fact]
    public async Task Handle_WithUnfinishedTasks_Throws()
    {
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new DomainCategory
        {
            CategoryId = categoryId,
            Name = "Work",
            UserId = userId,
            Tasks =
            {
                new DomainTask
                {
                    TaskId = Guid.NewGuid(),
                    Title = "Open",
                    IsCompleted = false,
                    UserId = userId,
                    CategoryId = categoryId,
                    CreatedAt = DateTime.UtcNow
                }
            }
        };

        var repo = new Mock<ICategoryRepository>();
        repo.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync(category);

        var handler = new DeleteCategoryCommandHandler(repo.Object, TestHttp.ForUser(userId));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new DeleteCategoryCommand { CategoryId = categoryId }, CancellationToken.None));

        Assert.Contains("belum selesai", ex.Message, StringComparison.OrdinalIgnoreCase);
        repo.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Handle_AllTasksCompleted_Deletes()
    {
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new DomainCategory
        {
            CategoryId = categoryId,
            Name = "Work",
            UserId = userId,
            Tasks =
            {
                new DomainTask
                {
                    TaskId = Guid.NewGuid(),
                    Title = "Done",
                    IsCompleted = true,
                    UserId = userId,
                    CategoryId = categoryId,
                    CreatedAt = DateTime.UtcNow
                }
            }
        };

        var repo = new Mock<ICategoryRepository>();
        repo.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync(category);
        repo.Setup(r => r.DeleteAsync(categoryId)).Returns(Task.CompletedTask);

        var handler = new DeleteCategoryCommandHandler(repo.Object, TestHttp.ForUser(userId));
        await handler.Handle(new DeleteCategoryCommand { CategoryId = categoryId }, CancellationToken.None);

        repo.Verify(r => r.DeleteAsync(categoryId), Times.Once);
    }
}
