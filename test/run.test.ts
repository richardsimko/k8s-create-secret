import { kStringMaxLength } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';

import * as core from '@actions/core';

import { mocked } from 'ts-jest/utils'

const k8s = require('@kubernetes/client-node');

import { CoreV1Api, KubeConfig, V1ObjectMeta, V1Secret } from '@kubernetes/client-node';

import { buildSecret, checkClusterContext } from '../src/run'

const mockk8s = mocked(k8s, true)
const mockApi = mocked(CoreV1Api, true);

const fileUtility = mocked(fs, true);

beforeAll(() => {
    process.env['RUNNER_TEMP'] = '/home/runner/work/_temp';
})

describe("checkClusterContext", () => {
    it('should pass when KUBECONFIG is set', () => {
        process.env['KUBECONFIG'] = 'test-kube-config';
        expect(checkClusterContext).not.toThrow(Error);
    })
    it('should throw when KUBECONFIG is not set', () => {
        process.env['KUBECONFIG'] = '';
        expect(checkClusterContext).toThrow(Error);
    })
})

describe("buildSecret", () => {
    beforeEach(() => {
        process.env['INPUT_SECRET-TYPE'] = 'generic';
    })
    it("should use api v1", async () => {
        let secret = await buildSecret('test-secret', 'test-namespace')
        expect(secret.apiVersion).toBe('v1')
    })

    it("should have namespace in metadata field", async () => {
        const testNamespace = 'test-namespace'
        let secret = await buildSecret('test-secret', testNamespace)
        expect(secret.metadata.namespace).toBe(testNamespace)
    })
    it("should have name in metadata field", async () => {
        const testNamespace = 'test-namespace'
        const testName = 'test-secret'
        let secret = await buildSecret(testName, testNamespace)
        expect(secret.metadata.name).toBe(testName)
    })
})
