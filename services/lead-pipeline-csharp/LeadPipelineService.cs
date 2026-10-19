using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;

namespace Eulr.LeadPipeline
{
    public class LeadRecord
    {
        public Guid Id { get; set; }
        public string CIFNumber { get; set; } = string.Empty;
        public string MRNNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string Status { get; set; } = "NEW";
        public DateTime IngestedAt { get; set; } = DateTime.UtcNow;
    }

    public class LeadDbContext : DbContext
    {
        public DbSet<LeadRecord> Leads { get; set; }

        public LeadDbContext(DbContextOptions<LeadDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LeadRecord>()
                .HasIndex(l => l.CIFNumber);
            modelBuilder.Entity<LeadRecord>()
                .HasIndex(l => l.MRNNumber);
        }
    }

    public class LeadPipelineProcessor
    {
        private readonly LeadDbContext _efContext;
        private readonly IDbConnection _dbConnection;

        public LeadPipelineProcessor(LeadDbContext efContext, IDbConnection dbConnection)
        {
            _efContext = efContext;
            _dbConnection = dbConnection;
        }

        /// <summary>
        /// High-throughput Lead Query using Dapper with Stored Procedure / raw SQL
        /// </summary>
        public async Task<IEnumerable<LeadRecord>> GetActiveLeadsByCIFAsync(string cifPrefix)
        {
            const string sql = @"
                SELECT Id, CIFNumber, MRNNumber, ClientName, Status, IngestedAt
                FROM Leads
                WHERE CIFNumber LIKE @Prefix + '%' AND Status = 'ACTIVE'
                ORDER BY IngestedAt DESC";

            return await _dbConnection.QueryAsync<LeadRecord>(sql, new { Prefix = cifPrefix });
        }

        /// <summary>
        /// CIF/MRN Lead Pipeline transformation utilizing LINQ
        /// </summary>
        public async Task<List<LeadRecord>> ProcessAndEnrichLeadsAsync(List<LeadRecord> incomingBatch)
        {
            // LINQ Pipeline Transformation & Deduplication
            var sanitizedLeads = incomingBatch
                .Where(lead => !string.IsNullOrWhiteSpace(lead.CIFNumber) && !string.IsNullOrWhiteSpace(lead.MRNNumber))
                .GroupBy(lead => lead.CIFNumber)
                .Select(group => group.First())
                .Select(lead => new LeadRecord
                {
                    Id = Guid.NewGuid(),
                    CIFNumber = lead.CIFNumber.Trim().ToUpper(),
                    MRNNumber = lead.MRNNumber.Trim().ToUpper(),
                    ClientName = lead.ClientName.Trim(),
                    Status = "QUALIFIED_FOR_CALL",
                    IngestedAt = DateTime.UtcNow
                })
                .ToList();

            // Persist via Entity Framework Core Batch Insert
            await _efContext.Leads.AddRangeAsync(sanitizedLeads);
            await _efContext.SaveChangesAsync();

            return sanitizedLeads;
        }
    }
}
