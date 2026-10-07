using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyConnect.Infrastructure.Migrations;

[DbContext(typeof(BeautyConnectDbContext))]
[Migration("20261007174000_AddSearchIndexes")]
public partial class AddSearchIndexes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_ProfessionalProfiles_City_VerificationStatus_RatingAverage",
            table: "ProfessionalProfiles",
            columns: new[] { "City", "VerificationStatus", "RatingAverage" });

        migrationBuilder.CreateIndex(
            name: "IX_Services_Category_Price",
            table: "Services",
            columns: new[] { "Category", "Price" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ProfessionalProfiles_City_VerificationStatus_RatingAverage",
            table: "ProfessionalProfiles");

        migrationBuilder.DropIndex(
            name: "IX_Services_Category_Price",
            table: "Services");
    }
}
