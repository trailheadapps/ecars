package com.example;

import com.salesforce.functions.demo.FunctionInput;
import com.salesforce.functions.demo.FunctionOutput;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.Org;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordQueryResult;
import org.junit.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.Optional;

import static com.spotify.hamcrest.pojo.IsPojo.pojo;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItems;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class FunctionTest {

  @Test
  public void test() throws Exception {
    RouteplannerFunction function = new RouteplannerFunction();
    FunctionOutput functionOutput = function.apply(createEventMock(), createContextMock());

    assertThat(
        functionOutput.getAccounts(),
        hasItems(
            pojo(Account.class)
                .withProperty("id", equalTo("5003000000D8cuIQAA"))
                .withProperty("name", equalTo("Account One, inc.")),
            pojo(Account.class)
                .withProperty("id", equalTo("6003000000D8cuIQAA"))
                .withProperty("name", equalTo("Account Two, inc."))));
  }

  private Context createContextMock() {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg()).then(i1 -> {
      Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

      when(mockOrg.getDataApi().query("SELECT Id, Name FROM Account")).then(i2 -> {
        RecordQueryResult mockResult = mock(RecordQueryResult.class);

        Record firstRecord = mock(Record.class);
        when(firstRecord.getStringField("Id")).thenReturn(Optional.of("5003000000D8cuIQAA"));
        when(firstRecord.getStringField("Name")).thenReturn(Optional.of("Account One, inc."));

        Record secondRecord = mock(Record.class);
        when(secondRecord.getStringField("Id")).thenReturn(Optional.of("6003000000D8cuIQAA"));
        when(secondRecord.getStringField("Name")).thenReturn(Optional.of("Account Two, inc."));

        when(mockResult.getRecords()).thenReturn(Arrays.asList(firstRecord, secondRecord));

        return mockResult;
      });

      return Optional.of(mockOrg);
    });

    return mockContext;
  }

  private InvocationEvent<FunctionInput> createEventMock() {
    return mock(InvocationEvent.class);
  }
}
