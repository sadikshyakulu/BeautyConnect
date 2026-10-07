using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingRefundTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefundGatewayReference",
                table: "Bookings",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundRequestedAt",
                table: "Bookings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefundStatus",
                table: "Bookings",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "NotRequested")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundedAt",
                table: "Bookings",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundGatewayReference",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundRequestedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundStatus",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundedAt",
                table: "Bookings");
        }
    }
}
