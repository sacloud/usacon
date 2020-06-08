/**
 * Copyright 2020 The UsaCon Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface APIKeyView {
  name: string;
  token: string;
  secret: string;
  errors: APIKeyErrors;
}

export type APIKeyErrors = Map<string, string>;

export class APIKey implements APIKeyView {
  name: string;
  token: string;
  secret: string;
  errors: APIKeyErrors;

  constructor(v?: APIKeyView) {
    this.name = v?.name || "";
    this.token = v?.token || "";
    this.secret = v?.secret || "";
    this.errors = v?.errors || new Map<string, string>([]);
  }

  get valid(): boolean {
    return this.errors.size === 0;
  }

  validate(): void {
    const errors = new Map<string, string>([]);
    if (this.name === "") {
      errors.set("name", "required");
    }
    if (this.token === "") {
      errors.set("token", "required");
    }
    if (this.secret === "") {
      errors.set("secret", "required");
    }
    this.errors = errors;
  }
}

export default APIKey;
