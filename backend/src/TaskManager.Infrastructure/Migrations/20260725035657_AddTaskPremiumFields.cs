using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskPremiumFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EstimatedMinutes",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPinnedFocus",
                table: "Tasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ScheduleEndMinutes",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScheduleStartMinutes",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrackingElapsedSeconds",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrackingStartedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedMinutes",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "IsPinnedFocus",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "ScheduleEndMinutes",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "ScheduleStartMinutes",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TrackingElapsedSeconds",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TrackingStartedAt",
                table: "Tasks");
        }
    }
}
