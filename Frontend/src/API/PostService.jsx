import React from "react";
import axios from "axios";

export default class PostService {
    static async getAll(page = 1, pageSize = 10) {
        try {
            const response = await axios.get("/events/filter", {
                params: {
                    page: page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при получении событий:", error);
            throw error;
        }
    }
    
}
