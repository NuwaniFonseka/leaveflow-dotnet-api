# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything
COPY . .

# Restore & publish
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# -------- RUNTIME STAGE --------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Cloud Run listens on 8080
EXPOSE 8080

# Copy published output
COPY --from=build /app/publish .

# Start the API
ENTRYPOINT ["dotnet", "LeaveFlow.Api.dll"]
