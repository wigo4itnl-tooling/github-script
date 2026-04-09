import {getOctokit} from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {OctokitOptions, OctokitPlugin} from '@octokit/core/dist-types/types'

type GetOctokit = typeof getOctokit

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      ;(result as Record<string, unknown>)[key] = value
    }
  }
  return result
}

export function createConfiguredGetOctokit(
  rawGetOctokit: GetOctokit,
  defaultOptions: OctokitOptions,
  ...defaultPlugins: OctokitPlugin[]
): GetOctokit {
  return (
    token: string,
    options?: OctokitOptions,
    ...additionalPlugins: OctokitPlugin[]
  ): InstanceType<typeof GitHub> => {
    const userOpts = stripUndefined(options || {})
    const defaultRequest = defaultOptions.request
    const userRequestRaw = userOpts.request as
      | Record<string, unknown>
      | undefined
    const userRequest = userRequestRaw ? stripUndefined(userRequestRaw) : {}
    const defaultRetry = defaultOptions.retry
    const userRetryRaw = userOpts.retry as Record<string, unknown> | undefined
    const userRetry = userRetryRaw ? stripUndefined(userRetryRaw) : {}

    const merged: OctokitOptions = {
      ...defaultOptions,
      ...userOpts,
      request: {...(defaultRequest || {}), ...userRequest},
      retry: {...(defaultRetry || {}), ...userRetry}
    }

    const allPlugins = [...defaultPlugins]
    for (const plugin of additionalPlugins) {
      if (!allPlugins.includes(plugin)) {
        allPlugins.push(plugin)
      }
    }

    return rawGetOctokit(token, merged, ...allPlugins)
  }
}
