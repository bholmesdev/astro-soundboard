import { QueryClient } from "@tanstack/react-query";
import { createContext } from "react";

const queryClient = new QueryClient();
export const QueryContext = createContext<QueryClient | undefined>(queryClient);
