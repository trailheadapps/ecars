package com.salesforce.functions.demo;

import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import java.util.Map;

public class FunctionOutput {
  public final String message;
  public final Map<ReferenceId, RecordModificationResult> result;

  public FunctionOutput(String message, Map<ReferenceId, RecordModificationResult> result) {
    this.message = message;
    this.result = result;
  }
}
