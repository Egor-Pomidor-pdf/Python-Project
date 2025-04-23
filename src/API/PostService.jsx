import React from "react";
import axios from "axios";

export default class PostService {
    static async getAll() {
        const response = await axios.get("http://26.65.201.207:8000/events/filter");
            return response
}
    static async bookTicket() {
        
    }
}
