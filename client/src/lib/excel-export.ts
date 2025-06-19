import { apiRequest } from "./queryClient";

export async function exportToExcel(tabType: string): Promise<void> {
  try {
    let endpoint = "";
    let filename = "";

    switch (tabType) {
      case "profit-calculator":
        endpoint = "/api/export/profit-scenarios";
        filename = "profit-scenarios.xlsx";
        break;
      case "retail-budget":
        endpoint = "/api/export/retail-budget";
        filename = "retail-budget.xlsx";
        break;
      case "professional-budget":
        endpoint = "/api/export/professional-budget";
        filename = "professional-budget.xlsx";
        break;
      default:
        throw new Error("Invalid tab type for export");
    }

    const response = await apiRequest("POST", endpoint);
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
