# ---------- BUILD STAGE ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file
COPY LeaveFlow.Api/LeaveFlow.Api.csproj ./LeaveFlow.Api/

# Restore dependencies
RUN dotnet restore ./LeaveFlow.Api/LeaveFlow.Api.csproj

# Copy the rest of the source code
COPY . .

# Publish
RUN dotnet publish ./LeaveFlow.Api/LeaveFlow.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ---------- RUNTIME STAGE ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "LeaveFlow.Api.dll"]
