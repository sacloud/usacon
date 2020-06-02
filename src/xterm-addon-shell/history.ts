/**
 * Copyright (c) 2020 The UsaCon Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/*
 *
 */
export class ShellHistory {
    size: number;
    entries: string[];
    cursor: number;

    constructor(size:number) {
        this.size = size;
        this.entries = [];
        this.cursor = 0;
    }

    public push(entry:string) : void {
        // Skip empty entries
        if (entry.trim() === "") return;
        // Skip duplicate entries
        const lastEntry = this.entries[this.entries.length - 1];
        if (entry == lastEntry) return;
        // Keep track of entries
        this.entries.push(entry);
        if (this.entries.length > this.size) {
            this.entries.pop();
        }
        this.cursor = this.entries.length;
    }

    public rewind() :void {
        this.cursor = this.entries.length;
    }

    public getPrevious() : string{
        const idx = Math.max(0, this.cursor - 1);
        this.cursor = idx;
        return this.entries[idx];
    }

    public getNext() : string{
        const idx = Math.min(this.entries.length, this.cursor + 1);
        this.cursor = idx;
        return this.entries[idx];
    }
}
