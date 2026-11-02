using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayouts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PayoutAccountName",
                table: "ProfessionalProfiles",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PayoutAccountNumberEncrypted",
                table: "ProfessionalProfiles",
                type: "varchar(2048)",
                maxLength: 2048,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PayoutBankName",
                table: "ProfessionalProfiles",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PayoutMethod",
                table: "ProfessionalProfiles",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "ProfessionalPayoutAmount",
                table: "PaymentIntents",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Bookings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PayoutRequestId",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ProfessionalPayoutAmount",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql(
                "UPDATE `Bookings` SET `ProfessionalPayoutAmount` = `TotalPrice`;");
            migrationBuilder.Sql(
                "UPDATE `Bookings` SET `CompletedAt` = UTC_TIMESTAMP(6) WHERE `Status` = 'Completed';");

            migrationBuilder.CreateTable(
                name: "PayoutRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ProfessionalProfileId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RequestedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ProcessedByAdminUserId = table.Column<int>(type: "int", nullable: true),
                    PayoutMethod = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AccountName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AccountNumberEncrypted = table.Column<string>(type: "varchar(2048)", maxLength: 2048, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BankName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reference = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RejectionReason = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OpenProfessionalProfileId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayoutRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayoutRequests_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PayoutRequests_Users_ProcessedByAdminUserId",
                        column: x => x.ProcessedByAdminUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_PayoutRequestId",
                table: "Bookings",
                column: "PayoutRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ProfessionalProfileId_Status_CompletedAt_PayoutRequ~",
                table: "Bookings",
                columns: new[] { "ProfessionalProfileId", "Status", "CompletedAt", "PayoutRequestId" });

            migrationBuilder.CreateIndex(
                name: "IX_PayoutRequests_OpenProfessionalProfileId",
                table: "PayoutRequests",
                column: "OpenProfessionalProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayoutRequests_ProcessedByAdminUserId",
                table: "PayoutRequests",
                column: "ProcessedByAdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PayoutRequests_ProfessionalProfileId_Status_RequestedAt",
                table: "PayoutRequests",
                columns: new[] { "ProfessionalProfileId", "Status", "RequestedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_PayoutRequests_PayoutRequestId",
                table: "Bookings",
                column: "PayoutRequestId",
                principalTable: "PayoutRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_PayoutRequests_PayoutRequestId",
                table: "Bookings");

            migrationBuilder.DropTable(
                name: "PayoutRequests");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_PayoutRequestId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ProfessionalProfileId_Status_CompletedAt_PayoutRequ~",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PayoutAccountName",
                table: "ProfessionalProfiles");

            migrationBuilder.DropColumn(
                name: "PayoutAccountNumberEncrypted",
                table: "ProfessionalProfiles");

            migrationBuilder.DropColumn(
                name: "PayoutBankName",
                table: "ProfessionalProfiles");

            migrationBuilder.DropColumn(
                name: "PayoutMethod",
                table: "ProfessionalProfiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalPayoutAmount",
                table: "PaymentIntents");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PayoutRequestId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ProfessionalPayoutAmount",
                table: "Bookings");
        }
    }
}
