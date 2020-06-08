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

export function saveAPIKeyToBrowser(apiKey) {
  const cred = new PasswordCredential({
    name: apiKey.name,
    id: apiKey.token,
    password: apiKey.secret,
  });
  return navigator.credentials.store(cred);
}

export function getAPIKey(required) {
  let mediation = "optional";
  if (required) {
    mediation = "required";
  }
  return navigator.credentials.get({ password: true, mediation: mediation });
}
