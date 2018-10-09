USE [master]
GO

CREATE DATABASE [Computer_Vision]
GO

CREATE TABLE [Computer_Vision].[dbo].[empleados]
(
    [Legajo] INT NOT NULL CONSTRAINT PK_Empleados PRIMARY KEY NONCLUSTERED,
    [Nombre] NVARCHAR(64) NOT NULL,
    [Apellido] NVARCHAR(64) NOT NULL,
    [Puesto] NVARCHAR(64) NOT NULL,
    [FaceId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_Empleados_FaceId UNIQUE
)
GO

CREATE TABLE [Computer_Vision].[dbo].[imgs]
(
    [FotoId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Imagenes PRIMARY KEY NONCLUSTERED,
    [Data] VARBINARY(MAX) NOT NULL,    
    [Legajo] INT NOT NULL CONSTRAINT FK_Imagenes_Legajo FOREIGN KEY REFERENCES [Computer_Vision].[dbo].[empleados](Legajo)
)
GO

CREATE CLUSTERED INDEX CIX_Imagenes_Legajo
    ON [Computer_Vision].[dbo].[imgs]([Legajo] ASC);
GO