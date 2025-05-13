import React from "react";
import axios from "axios";

export default class PostService {
    static async getAll() {
        const response = await axios.get("/events/filter");
            return response
}

}
