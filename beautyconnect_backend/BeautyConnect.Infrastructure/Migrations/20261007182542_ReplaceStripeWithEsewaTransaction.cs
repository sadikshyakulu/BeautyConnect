using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceStripeWithEsewaTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EsewaTotalAmount",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EsewaTransactionCode",
                table: "Bookings",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EsewaTransactionUuid",
                table: "Bookings",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_EsewaTransactionUuid",
                table: "Bookings",
                column: "EsewaTransactionUuid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_EsewaTransactionUuid",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "EsewaTotalAmount",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "EsewaTransactionCode",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "EsewaTransactionUuid",
                table: "Bookings");
        }
    }
}
