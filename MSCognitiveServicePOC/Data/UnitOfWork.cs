using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Transactions;

namespace WebApplication1
{
    public class UnitOfWork : IDisposable
    {
        private IDbConnection _connection;
        private bool _disposed;

        public IDbConnection Connection
        {
            get
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                if (Transaction.Current != null && _connection is SqlConnection)
                {
                    ((SqlConnection)_connection).EnlistTransaction(Transaction.Current);
                }

                return _connection;
            }
        }

        public UnitOfWork(string connectionString)
        {
            _connection = new SqlConnection(connectionString);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    if (_connection != null)
                    {
                        _connection.Dispose();
                        _connection = null;
                    }
                }

                _disposed = true;
            }
        }

        public Task<IEnumerable<TResult>> QueryAsync<TResult>(string command, object parameters, IDbTransaction transaction = null, CommandType? commandType = null)
        {
            return Connection.QueryAsync<TResult>(command, parameters, transaction, commandType: commandType);
        }
        public Task<int> ExecuteAsync(string command, object parameters, IDbTransaction transaction = null, CommandType? commandType = null)
        {
            return Connection.ExecuteAsync(command, parameters, transaction, commandType: commandType);
        }
    }
}