using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "PaymentIntents",
                type: "varchar(30)",
                maxLength: 30,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationAddress",
                table: "PaymentIntents",
                type: "varchar(300)",
                maxLength: 300,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationCity",
                table: "PaymentIntents",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationLandmark",
                table: "PaymentIntents",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "LocationLatitude",
                table: "PaymentIntents",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LocationLongitude",
                table: "PaymentIntents",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Bookings",
                type: "varchar(30)",
                maxLength: 30,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationAddress",
                table: "Bookings",
                type: "varchar(300)",
                maxLength: 300,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationCity",
                table: "Bookings",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LocationLandmark",
                table: "Bookings",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "LocationLatitude",
                table: "Bookings",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LocationLongitude",
                table: "Bookings",
                type: "double",
                nullable: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "LocationAddress",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "LocationCity",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "LocationLandmark",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "LocationLatitude",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "LocationLongitude",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LocationAddress",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LocationCity",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LocationLandmark",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LocationLatitude",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LocationLongitude",
                table: "Bookings");

        }
    }
}
